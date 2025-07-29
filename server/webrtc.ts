import { Server } from "socket.io";
import http from "http";

interface CallUser {
  id: string;
  nickname?: string;
  socketId: string;
}

interface CallRoom {
  id: string;
  users: CallUser[];
  type: "audio" | "video";
  createdAt: Date;
}

export class WebRTCService {
  private io: Server;
  private rooms: Map<string, CallRoom> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  constructor(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`用户连接 WebRTC: ${socket.id}`);

      // 用户加入通话
      socket.on("join-call", ({ userId, roomId, nickname, type = "video" }) => {
        try {
          const user: CallUser = {
            id: userId,
            nickname,
            socketId: socket.id
          };

          this.userSockets.set(userId, socket.id);
          socket.join(roomId);

          if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, {
              id: roomId,
              users: [],
              type,
              createdAt: new Date()
            });
          }

          const room = this.rooms.get(roomId)!;
          room.users.push(user);

          // 通知房间内其他用户有新用户加入
          socket.to(roomId).emit("user-joined", { user });

          // 发送当前房间用户列表给新加入的用户
          socket.emit("room-users", { users: room.users.filter(u => u.id !== userId) });

          console.log(`用户 ${nickname}(${userId}) 加入通话房间 ${roomId}`);
        } catch (error) {
          console.error("加入通话失败:", error);
          socket.emit("call-error", { message: "加入通话失败" });
        }
      });

      // 发送 WebRTC 信令
      socket.on("offer", ({ roomId, offer, targetUserId }) => {
        const targetSocketId = this.userSockets.get(targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit("offer", {
            offer,
            fromUserId: this.getUserIdBySocketId(socket.id)
          });
        }
      });

      socket.on("answer", ({ roomId, answer, targetUserId }) => {
        const targetSocketId = this.userSockets.get(targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit("answer", {
            answer,
            fromUserId: this.getUserIdBySocketId(socket.id)
          });
        }
      });

      socket.on("ice-candidate", ({ roomId, candidate, targetUserId }) => {
        const targetSocketId = this.userSockets.get(targetUserId);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit("ice-candidate", {
            candidate,
            fromUserId: this.getUserIdBySocketId(socket.id)
          });
        }
      });

      // 切换音频/视频状态
      socket.on("toggle-audio", ({ roomId, enabled }) => {
        socket.to(roomId).emit("user-audio-toggle", {
          userId: this.getUserIdBySocketId(socket.id),
          enabled
        });
      });

      socket.on("toggle-video", ({ roomId, enabled }) => {
        socket.to(roomId).emit("user-video-toggle", {
          userId: this.getUserIdBySocketId(socket.id),
          enabled
        });
      });

      // 离开通话
      socket.on("leave-call", ({ roomId }) => {
        this.handleUserLeave(socket.id, roomId);
      });

      // 断开连接
      socket.on("disconnect", () => {
        console.log(`用户断开 WebRTC 连接: ${socket.id}`);
        this.handleUserDisconnect(socket.id);
      });
    });
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, userSocketId] of this.userSockets.entries()) {
      if (userSocketId === socketId) {
        return userId;
      }
    }
    return undefined;
  }

  private handleUserLeave(socketId: string, roomId: string) {
    const userId = this.getUserIdBySocketId(socketId);
    if (!userId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    // 从房间移除用户
    room.users = room.users.filter(user => user.socketId !== socketId);
    
    // 通知其他用户
    this.io.to(roomId).emit("user-left", { userId });

    // 如果房间为空，删除房间
    if (room.users.length === 0) {
      this.rooms.delete(roomId);
    }

    this.userSockets.delete(userId);
    console.log(`用户 ${userId} 离开通话房间 ${roomId}`);
  }

  private handleUserDisconnect(socketId: string) {
    const userId = this.getUserIdBySocketId(socketId);
    if (!userId) return;

    // 查找用户所在的房间并处理离开
    for (const [roomId, room] of this.rooms.entries()) {
      const userInRoom = room.users.find(user => user.socketId === socketId);
      if (userInRoom) {
        this.handleUserLeave(socketId, roomId);
        break;
      }
    }
  }

  // 获取房间信息
  getRoomInfo(roomId: string): CallRoom | undefined {
    return this.rooms.get(roomId);
  }

  // 获取所有活跃房间
  getActiveRooms(): CallRoom[] {
    return Array.from(this.rooms.values());
  }
}

let webRTCService: WebRTCService | null = null;

export function initializeWebRTC(server: http.Server): WebRTCService {
  if (!webRTCService) {
    webRTCService = new WebRTCService(server);
    console.log("✅ WebRTC 服务已初始化");
  }
  return webRTCService;
}

export function getWebRTCService(): WebRTCService | null {
  return webRTCService;
}