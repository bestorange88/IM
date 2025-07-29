import { WebSocketServer, WebSocket } from "ws";
import { verifyJwtToken } from "./middleware";
import { getEnhancedStorage } from "./enhanced-storage-init";
import { MessageService } from "./message-service";

interface WSClient extends WebSocket {
  userId?: string;
  roomId?: string;
}

const wss = new WebSocketServer({ noServer: true });

const db = getEnhancedStorage()?.db;
const messageService = db ? new MessageService(db) : null;

// 房间在线用户映射
const rooms: Record<string, Set<WSClient>> = {};

function broadcast(roomId: string, message: any, exclude?: WSClient) {
  const clients = rooms[roomId] || new Set();
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(JSON.stringify(message));
    }
  }
}

wss.on("connection", (ws: WSClient, req) => {
  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === "auth") {
        const token = msg.token;
        const user = verifyJwtToken(token);
        if (!user) return ws.close();
        ws.userId = user.userId;
        ws.roomId = msg.roomId;
        if (!rooms[ws.roomId]) rooms[ws.roomId] = new Set();
        rooms[ws.roomId].add(ws);
        console.log(`🟢 用户 ${ws.userId} 加入房间 ${ws.roomId}`);
        return;
      }

      if (msg.type === "chat" && ws.userId && ws.roomId) {
        const { content } = msg;
        const payload = {
          senderId: ws.userId,
          roomId: ws.roomId,
          content,
          createdAt: new Date()
        };
        await messageService?.sendMessage(ws.userId, ws.roomId, content);
        broadcast(ws.roomId, { type: "chat", ...payload }, ws);
      }
    } catch (err) {
      console.error("WebSocket 错误:", err);
    }
  });

  ws.on("close", () => {
    if (ws.roomId && rooms[ws.roomId]) {
      rooms[ws.roomId].delete(ws);
      if (rooms[ws.roomId].size === 0) delete rooms[ws.roomId];
    }
  });
});

export { wss };