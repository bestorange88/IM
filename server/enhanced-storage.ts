import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, desc, or, and, sql, like, inArray } from "drizzle-orm";
import * as schema from "@shared/schema";
import {
  users,
  chatRooms,
  messages,
  privateMessages,
  roomMembers,
  friendships,
  fileAttachments,
  messageReadStatus,
  type User,
  type InsertUser,
  type ChatRoom,
  type Message,
  type PrivateMessage,
  type RoomMember,
  type FileAttachment,
  type InsertChatRoom,
  type InsertMessage,
  type InsertPrivateMessage,
  type InsertRoomMember,
  type InsertFileAttachment,
  type ChatRoomWithMembers,
  type MessageWithUser
} from "@shared/schema";
import { IStorage } from "./storage";

export class EnhancedMySQLStorage implements IStorage {
  private db!: ReturnType<typeof drizzle>;

  constructor(databaseUrl: string) {
    this.initSync(databaseUrl);
  }

  private initSync(databaseUrl: string) {
    console.log("正在连接增强版MySQL数据库...");
    console.log("数据库URL:", databaseUrl.replace(/:[^:@]*@/, ':***@'));

    // 解析数据库URL
    const urlPattern = /mysql:\/\/(.+):(.+)@(.+):(\d+)\/(.+)/;
    const match = databaseUrl.match(urlPattern);
    if (!match) throw new Error("数据库URL格式错误");

    const [, username, password, host, port, database] = match;

    const config = {
      host,
      port: parseInt(port),
      user: username,
      password,
      database,
      connectTimeout: 5000,
      acquireTimeout: 5000,
      timeout: 5000,
      multipleStatements: true,
    };

    console.log("增强版MySQL配置:", { ...config, password: '***' });

    // 使用连接池
    const pool = mysql.createPool(config);
    this.db = drizzle(pool, { schema, mode: 'default' });
    
    // 测试连接
    this.testConnectionSync();
  }

  private testConnectionSync(): void {
    this.testConnection().catch((error) => {
      console.error("❌ 增强版MySQL数据库连接测试失败:", error);
    });
  }
  
  private async testConnection(): Promise<void> {
    await this.db.select().from(users).limit(1);
    console.log("✅ 增强版MySQL数据库连接测试成功");
  }

  // ============================================================================
  // 用户管理
  // ============================================================================

  async getUser(id: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0];
    } catch (error) {
      console.error("获取用户失败:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
      return result[0];
    } catch (error) {
      console.error("根据用户名获取用户失败:", error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.db
        .select({
          id: users.id,
          username: users.username,
          nickname: users.nickname,
          email: users.email,
          avatar: users.avatar,
          status: users.status,
          isOnline: users.isOnline,
          lastSeen: users.lastSeen,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .orderBy(users.createdAt);
      return result;
    } catch (error) {
      console.error("获取所有用户失败:", error);
      return [];
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const result = await this.db.insert(users).values(user);
      const newUser = await this.getUser(user.id);
      if (!newUser) throw new Error("创建用户后无法获取用户信息");
      return newUser;
    } catch (error) {
      console.error("创建用户失败:", error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    try {
      await this.db
        .update(users)
        .set({ 
          status, 
          isOnline: status === 'online',
          lastSeen: new Date()
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("更新用户状态失败:", error);
      throw error;
    }
  }

  async updateUserPresence(userId: string, status: 'online' | 'away' | 'busy' | 'offline' | 'invisible', deviceType?: string): Promise<void> {
    try {
      await this.db
        .update(users)
        .set({ 
          status, 
          isOnline: status === 'online',
          lastSeen: new Date()
        })
        .where(eq(users.id, userId));
      
      // 这里可以扩展到 user_presence 表来记录设备信息
      console.log(`用户 ${userId} 状态更新为 ${status}${deviceType ? ` (设备: ${deviceType})` : ''}`);
    } catch (error) {
      console.error("更新用户在线状态失败:", error);
      throw error;
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.isOnline, true))
        .orderBy(users.lastSeen);
      return result;
    } catch (error) {
      console.error("获取在线用户失败:", error);
      return [];
    }
  }

  // ============================================================================
  // 聊天室管理
  // ============================================================================

  async getChatRooms(): Promise<ChatRoomWithMembers[]> {
    try {
      const rooms = await this.db
        .select()
        .from(chatRooms)
        .orderBy(chatRooms.createdAt);

      const roomsWithMembers: ChatRoomWithMembers[] = [];
      
      for (const room of rooms) {
        const members = await this.db
          .select({
            user: users,
            role: roomMembers.role,
            joinedAt: roomMembers.joinedAt
          })
          .from(roomMembers)
          .innerJoin(users, eq(roomMembers.userId, users.id))
          .where(eq(roomMembers.roomId, room.id));

        roomsWithMembers.push({
          ...room,
          members: members.map(m => ({ ...m.user, role: m.role, joinedAt: m.joinedAt }))
        });
      }

      return roomsWithMembers;
    } catch (error) {
      console.error("获取聊天室列表失败:", error);
      return [];
    }
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    try {
      const result = await this.db.insert(chatRooms).values(room);
      const newRoom = await this.db
        .select()
        .from(chatRooms)
        .where(eq(chatRooms.id, result[0].insertId))
        .limit(1);
      
      if (!newRoom[0]) throw new Error("创建聊天室后无法获取聊天室信息");
      return newRoom[0];
    } catch (error) {
      console.error("创建聊天室失败:", error);
      throw error;
    }
  }

  async addRoomMember(member: InsertRoomMember): Promise<RoomMember> {
    try {
      await this.db.insert(roomMembers).values(member);
      const newMember = await this.db
        .select()
        .from(roomMembers)
        .where(and(
          eq(roomMembers.roomId, member.roomId),
          eq(roomMembers.userId, member.userId)
        ))
        .limit(1);
      
      if (!newMember[0]) throw new Error("添加房间成员后无法获取成员信息");
      return newMember[0];
    } catch (error) {
      console.error("添加房间成员失败:", error);
      throw error;
    }
  }

  async removeRoomMember(roomId: number, userId: string): Promise<void> {
    try {
      await this.db
        .delete(roomMembers)
        .where(and(
          eq(roomMembers.roomId, roomId),
          eq(roomMembers.userId, userId)
        ));
    } catch (error) {
      console.error("移除房间成员失败:", error);
      throw error;
    }
  }

  async updateMemberRole(roomId: number, userId: string, role: string): Promise<void> {
    try {
      await this.db
        .update(roomMembers)
        .set({ role })
        .where(and(
          eq(roomMembers.roomId, roomId),
          eq(roomMembers.userId, userId)
        ));
    } catch (error) {
      console.error("更新成员角色失败:", error);
      throw error;
    }
  }

  // ============================================================================
  // 消息管理
  // ============================================================================

  async getRoomMessages(roomId: number, limit: number = 50): Promise<MessageWithUser[]> {
    try {
      const result = await this.db
        .select({
          id: messages.id,
          content: messages.content,
          type: messages.type,
          timestamp: messages.timestamp,
          isRead: messages.isRead,
          replyTo: messages.replyTo,
          senderId: messages.senderId,
          roomId: messages.roomId,
          user: {
            id: users.id,
            username: users.username,
            nickname: users.nickname,
            avatar: users.avatar
          }
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.roomId, roomId))
        .orderBy(desc(messages.timestamp))
        .limit(limit);

      return result.reverse(); // 返回正序消息
    } catch (error) {
      console.error("获取房间消息失败:", error);
      return [];
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      const result = await this.db.insert(messages).values(message);
      const newMessage = await this.db
        .select()
        .from(messages)
        .where(eq(messages.id, result[0].insertId))
        .limit(1);
      
      if (!newMessage[0]) throw new Error("创建消息后无法获取消息信息");
      return newMessage[0];
    } catch (error) {
      console.error("创建消息失败:", error);
      throw error;
    }
  }

  async getMessageWithUser(messageId: number): Promise<MessageWithUser> {
    try {
      const result = await this.db
        .select({
          id: messages.id,
          content: messages.content,
          type: messages.type,
          timestamp: messages.timestamp,
          isRead: messages.isRead,
          replyTo: messages.replyTo,
          senderId: messages.senderId,
          roomId: messages.roomId,
          user: {
            id: users.id,
            username: users.username,
            nickname: users.nickname,
            avatar: users.avatar
          }
        })
        .from(messages)
        .innerJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.id, messageId))
        .limit(1);

      if (!result[0]) throw new Error("消息不存在");
      return result[0];
    } catch (error) {
      console.error("获取消息详情失败:", error);
      throw error;
    }
  }

  async deleteMessage(messageId: number): Promise<void> {
    try {
      await this.db
        .update(messages)
        .set({ content: "消息已被删除", type: "deleted" })
        .where(eq(messages.id, messageId));
    } catch (error) {
      console.error("删除消息失败:", error);
      throw error;
    }
  }

  async editMessage(messageId: number, content: string): Promise<void> {
    try {
      await this.db
        .update(messages)
        .set({ content })
        .where(eq(messages.id, messageId));
    } catch (error) {
      console.error("编辑消息失败:", error);
      throw error;
    }
  }

  // ============================================================================
  // 私聊消息
  // ============================================================================

  async getPrivateMessages(userId1: string, userId2: string, limit: number = 50): Promise<PrivateMessage[]> {
    try {
      const result = await this.db
        .select()
        .from(privateMessages)
        .where(
          or(
            and(eq(privateMessages.senderId, userId1), eq(privateMessages.receiverId, userId2)),
            and(eq(privateMessages.senderId, userId2), eq(privateMessages.receiverId, userId1))
          )
        )
        .orderBy(desc(privateMessages.timestamp))
        .limit(limit);

      return result.reverse();
    } catch (error) {
      console.error("获取私聊消息失败:", error);
      return [];
    }
  }

  async createPrivateMessage(message: InsertPrivateMessage): Promise<PrivateMessage> {
    try {
      const result = await this.db.insert(privateMessages).values(message);
      const newMessage = await this.db
        .select()
        .from(privateMessages)
        .where(eq(privateMessages.id, result[0].insertId))
        .limit(1);
      
      if (!newMessage[0]) throw new Error("创建私聊消息后无法获取消息信息");
      return newMessage[0];
    } catch (error) {
      console.error("创建私聊消息失败:", error);
      throw error;
    }
  }

  async markPrivateMessageAsRead(messageId: number, userId: string): Promise<void> {
    try {
      await this.db
        .update(privateMessages)
        .set({ isRead: true })
        .where(and(
          eq(privateMessages.id, messageId),
          eq(privateMessages.receiverId, userId)
        ));
    } catch (error) {
      console.error("标记私聊消息为已读失败:", error);
      throw error;
    }
  }

  async getPrivateConversations(userId: string): Promise<User[]> {
    try {
      // 获取所有与该用户有私聊记录的用户
      const conversations = await this.db
        .selectDistinct({
          userId: sql<string>`CASE 
            WHEN ${privateMessages.senderId} = ${userId} THEN ${privateMessages.receiverId}
            ELSE ${privateMessages.senderId}
          END`.as('userId')
        })
        .from(privateMessages)
        .where(
          or(
            eq(privateMessages.senderId, userId),
            eq(privateMessages.receiverId, userId)
          )
        );

      if (conversations.length === 0) return [];

      const userIds = conversations.map(c => c.userId);
      const result = await this.db
        .select()
        .from(users)
        .where(inArray(users.id, userIds));

      return result;
    } catch (error) {
      console.error("获取私聊对话列表失败:", error);
      return [];
    }
  }

  // ============================================================================
  // 好友功能（简化实现）
  // ============================================================================

  async getFriends(userId: string): Promise<User[]> {
    try {
      const friendIds = await this.db
        .select({ friendId: friendships.friendId })
        .from(friendships)
        .where(and(
          eq(friendships.userId, userId),
          eq(friendships.status, 'accepted')
        ));

      if (friendIds.length === 0) return [];

      const result = await this.db
        .select({
          id: users.id,
          username: users.username,
          nickname: users.nickname,
          email: users.email,
          avatar: users.avatar,
          status: users.status,
          isOnline: users.isOnline,
          lastSeen: users.lastSeen,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .where(inArray(users.id, friendIds.map(f => f.friendId)));

      return result;
    } catch (error) {
      console.error("获取好友列表失败:", error);
      return [];
    }
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    try {
      // 双向添加好友关系
      await this.db.insert(friendships).values([
        { userId, friendId, status: 'accepted', requestedBy: userId },
        { userId: friendId, friendId: userId, status: 'accepted', requestedBy: userId }
      ]);
    } catch (error) {
      console.error("添加好友失败:", error);
      throw error;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    try {
      await this.db
        .delete(friendships)
        .where(
          or(
            and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
            and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
          )
        );
    } catch (error) {
      console.error("删除好友失败:", error);
      throw error;
    }
  }

  // ============================================================================
  // 简化的其他方法实现
  // ============================================================================

  async getFriendRequests(userId: string): Promise<User[]> { return []; }
  async acceptFriendRequest(userId: string, friendId: string): Promise<void> {}
  async declineFriendRequest(userId: string, friendId: string): Promise<void> {}
  async blockUser(userId: string, blockedUserId: string): Promise<void> {}
  async unblockUser(userId: string, blockedUserId: string): Promise<void> {}

  async searchUsers(query: string): Promise<User[]> {
    try {
      const result = await this.db
        .select({
          id: users.id,
          username: users.username,
          nickname: users.nickname,
          email: users.email,
          avatar: users.avatar,
          status: users.status,
          isOnline: users.isOnline,
          lastSeen: users.lastSeen,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        })
        .from(users)
        .where(
          or(
            like(users.username, `%${query}%`),
            like(users.nickname, `%${query}%`),
            like(users.email, `%${query}%`)
          )
        )
        .limit(20);

      return result;
    } catch (error) {
      console.error("搜索用户失败:", error);
      return [];
    }
  }

  async searchMessages(userId: string, query: string, roomId?: number): Promise<MessageWithUser[]> { return []; }

  async uploadFile(file: InsertFileAttachment): Promise<FileAttachment> {
    try {
      const result = await this.db.insert(fileAttachments).values(file);
      const newFile = await this.db
        .select()
        .from(fileAttachments)
        .where(eq(fileAttachments.id, result[0].insertId))
        .limit(1);
      
      if (!newFile[0]) throw new Error("上传文件后无法获取文件信息");
      return newFile[0];
    } catch (error) {
      console.error("上传文件失败:", error);
      throw error;
    }
  }

  async getFileAttachment(fileId: number): Promise<FileAttachment | undefined> {
    try {
      const result = await this.db
        .select()
        .from(fileAttachments)
        .where(eq(fileAttachments.id, fileId))
        .limit(1);
      return result[0];
    } catch (error) {
      console.error("获取文件附件失败:", error);
      return undefined;
    }
  }

  async deleteFile(fileId: number): Promise<void> {}

  async createNotification(userId: string, title: string, body: string, type: string, relatedId?: number): Promise<void> {}
  async getUnreadNotifications(userId: string): Promise<any[]> { return []; }
  async markNotificationAsRead(notificationId: number): Promise<void> {}

  async getUserSetting(userId: string, key: string): Promise<string | undefined> { return undefined; }
  async setUserSetting(userId: string, key: string, value: string, type?: string): Promise<void> {}
  async getUserSettings(userId: string): Promise<Record<string, string>> { return {}; }
}