import { Router } from "express";
import { verifyToken } from "./middleware";
import { getEnhancedStorage } from "./enhanced-storage-init";
import { MessageService } from "./message-service";

export const messageRoutes = Router();

const db = getEnhancedStorage()?.db;
const messageService = db ? new MessageService(db) : null;

if (!messageService) {
  console.warn("⚠️ 消息服务初始化失败，相关 API 不可用");
}

// 发送消息
messageRoutes.post("/api/messages/send", verifyToken, async (req, res) => {
  const { roomId, content } = req.body;
  const senderId = req.user?.userId;

  if (!senderId || !roomId || !content) {
    return res.status(400).json({ error: "消息参数不完整" });
  }

  try {
    await messageService!.sendMessage(senderId, roomId, content);
    res.json({ message: "发送成功" });
  } catch (err) {
    console.error("消息发送失败:", err);
    res.status(500).json({ error: "消息发送失败" });
  }
});

// 获取房间消息
messageRoutes.get("/api/messages/:roomId", verifyToken, async (req, res) => {
  const { roomId } = req.params;
  if (!roomId) return res.status(400).json({ error: "房间ID缺失" });

  try {
    const messages = await messageService!.getMessages(roomId);
    res.json(messages);
  } catch (err) {
    console.error("获取消息失败:", err);
    res.status(500).json({ error: "无法获取消息" });
  }
});