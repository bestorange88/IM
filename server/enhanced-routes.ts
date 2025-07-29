import { Router } from "express";
import { z } from "zod";
import { EnhancedMySQLStorage } from "./enhanced-mysql-storage";
import { insertUserSchema, insertChatRoomSchema, insertMessageSchema, insertPrivateMessageSchema } from "@shared/schema";

const router = Router();

// 类型定义
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    nickname?: string;
  };
}

// 增强存储实例
let enhancedStorage: EnhancedMySQLStorage | null = null;

// 初始化增强存储
function initializeEnhancedStorage(databaseUrl: string) {
  try {
    enhancedStorage = new EnhancedMySQLStorage(databaseUrl);
    console.log("✅ 增强存储系统初始化成功");
  } catch (error) {
    console.error("❌ 增强存储系统初始化失败:", error);
  }
}

// 中间件：检查增强存储是否可用
function requireEnhancedStorage(req: any, res: any, next: any) {
  if (!enhancedStorage) {
    return res.status(503).json({ error: "增强存储系统不可用" });
  }
  req.enhancedStorage = enhancedStorage;
  next();
}

// 中间件：验证用户身份
function requireAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: "未提供认证令牌" });
  }
  
  try {
    // 这里应该验证JWT令牌，简化处理
    const user = { id: 'testuser123', username: 'testuser123', nickname: '测试用户' };
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "无效的认证令牌" });
  }
}

// ============================================================================
// 用户在线状态管理
// ============================================================================

// 更新用户在线状态
router.post("/api/users/presence", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const { status, deviceType } = req.body;
    
    if (!['online', 'away', 'busy', 'offline', 'invisible'].includes(status)) {
      return res.status(400).json({ error: "无效的状态值" });
    }
    
    await req.enhancedStorage.updateUserPresence(req.user.id, status, deviceType);
    
    res.json({ 
      success: true, 
      message: "用户状态更新成功",
      status,
      deviceType 
    });
  } catch (error) {
    console.error("更新用户状态失败:", error);
    res.status(500).json({ error: "更新用户状态失败" });
  }
});

// 获取用户在线状态
router.get("/api/users/presence/:userId", requireEnhancedStorage, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const presence = await req.enhancedStorage.getUserPresence(userId);
    
    if (!presence) {
      return res.status(404).json({ error: "未找到用户状态信息" });
    }
    
    res.json(presence);
  } catch (error) {
    console.error("获取用户状态失败:", error);
    res.status(500).json({ error: "获取用户状态失败" });
  }
});

// 获取所有在线用户
router.get("/api/users/online", requireEnhancedStorage, async (req: any, res) => {
  try {
    const onlineUsers = await req.enhancedStorage.getOnlineUsers();
    res.json(onlineUsers);
  } catch (error) {
    console.error("获取在线用户失败:", error);
    res.status(500).json({ error: "获取在线用户失败" });
  }
});

// ============================================================================
// 增强的聊天室管理
// ============================================================================

// 获取聊天室详细信息（包含群组信息）
router.get("/api/rooms/:roomId/info", requireEnhancedStorage, async (req: any, res) => {
  try {
    const { roomId } = req.params;
    const rooms = await req.enhancedStorage.getChatRooms();
    const room = rooms.find(r => r.id === parseInt(roomId));
    
    if (!room) {
      return res.status(404).json({ error: "聊天室不存在" });
    }
    
    // 这里可以添加获取群组详细信息的逻辑
    res.json({
      ...room,
      groupInfo: {
        maxMembers: 500,
        joinPolicy: 'open',
        memberCount: room.members.length,
        announcement: "欢迎加入群聊",
        rules: "请遵守群规，文明聊天"
      }
    });
  } catch (error) {
    console.error("获取聊天室信息失败:", error);
    res.status(500).json({ error: "获取聊天室信息失败" });
  }
});

// 更新聊天室设置
router.put("/api/rooms/:roomId/settings", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const { roomId } = req.params;
    const { announcement, rules, maxMembers, joinPolicy } = req.body;
    
    // 这里应该添加权限检查（只有管理员可以修改）
    
    // 使用原生SQL更新群组信息
    await req.enhancedStorage.db.execute(`
      UPDATE group_info 
      SET announcement = ?, rules = ?, maxMembers = ?, joinPolicy = ?, updatedAt = NOW()
      WHERE roomId = ?
    `, [announcement, rules, maxMembers, joinPolicy, roomId]);
    
    res.json({ success: true, message: "聊天室设置更新成功" });
  } catch (error) {
    console.error("更新聊天室设置失败:", error);
    res.status(500).json({ error: "更新聊天室设置失败" });
  }
});

// ============================================================================
// 消息增强功能
// ============================================================================

// 添加消息表情回应
router.post("/api/messages/:messageId/reactions", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    
    if (!emoji || emoji.length > 10) {
      return res.status(400).json({ error: "无效的表情符号" });
    }
    
    // 使用原生SQL插入表情回应
    await req.enhancedStorage.db.execute(`
      INSERT INTO message_reactions (messageId, userId, emoji, createdAt)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE createdAt = NOW()
    `, [messageId, req.user.id, emoji]);
    
    res.json({ success: true, message: "表情回应添加成功" });
  } catch (error) {
    console.error("添加表情回应失败:", error);
    res.status(500).json({ error: "添加表情回应失败" });
  }
});

// 删除消息表情回应
router.delete("/api/messages/:messageId/reactions/:emoji", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const { messageId, emoji } = req.params;
    
    await req.enhancedStorage.db.execute(`
      DELETE FROM message_reactions 
      WHERE messageId = ? AND userId = ? AND emoji = ?
    `, [messageId, req.user.id, emoji]);
    
    res.json({ success: true, message: "表情回应删除成功" });
  } catch (error) {
    console.error("删除表情回应失败:", error);
    res.status(500).json({ error: "删除表情回应失败" });
  }
});

// 获取消息的所有表情回应
router.get("/api/messages/:messageId/reactions", requireEnhancedStorage, async (req: any, res) => {
  try {
    const { messageId } = req.params;
    
    const reactions = await req.enhancedStorage.db.execute(`
      SELECT mr.emoji, mr.userId, u.nickname, mr.createdAt
      FROM message_reactions mr
      LEFT JOIN users u ON mr.userId = u.id
      WHERE mr.messageId = ?
      ORDER BY mr.createdAt ASC
    `, [messageId]);
    
    res.json(reactions);
  } catch (error) {
    console.error("获取消息表情回应失败:", error);
    res.status(500).json({ error: "获取消息表情回应失败" });
  }
});

// ============================================================================
// 推送通知系统
// ============================================================================

// 创建推送通知
router.post("/api/notifications", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const { userId, title, body, type, relatedId } = req.body;
    
    await req.enhancedStorage.createNotification(userId, title, body, type, relatedId);
    
    res.json({ success: true, message: "通知创建成功" });
  } catch (error) {
    console.error("创建通知失败:", error);
    res.status(500).json({ error: "创建通知失败" });
  }
});

// 获取用户的未读通知
router.get("/api/notifications/unread", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const notifications = await req.enhancedStorage.getUnreadNotifications(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error("获取未读通知失败:", error);
    res.status(500).json({ error: "获取未读通知失败" });
  }
});

// 标记通知为已读
router.put("/api/notifications/:notificationId/read", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const { notificationId } = req.params;
    await req.enhancedStorage.markNotificationAsRead(parseInt(notificationId));
    
    res.json({ success: true, message: "通知已标记为已读" });
  } catch (error) {
    console.error("标记通知为已读失败:", error);
    res.status(500).json({ error: "标记通知为已读失败" });
  }
});

// ============================================================================
// 用户设置管理
// ============================================================================

// 获取用户设置
router.get("/api/users/settings", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const settings = await req.enhancedStorage.getUserSettings(req.user.id);
    res.json(settings);
  } catch (error) {
    console.error("获取用户设置失败:", error);
    res.status(500).json({ error: "获取用户设置失败" });
  }
});

// 更新用户设置
router.put("/api/users/settings", requireEnhancedStorage, requireAuth, async (req: any, res) => {
  try {
    const { key, value, type = 'string' } = req.body;
    
    await req.enhancedStorage.setUserSetting(req.user.id, key, value, type);
    
    res.json({ success: true, message: "设置更新成功" });
  } catch (error) {
    console.error("更新用户设置失败:", error);
    res.status(500).json({ error: "更新用户设置失败" });
  }
});

// ============================================================================
// 系统统计和监控
// ============================================================================

// 获取系统统计信息
router.get("/api/admin/statistics", requireEnhancedStorage, async (req: any, res) => {
  try {
    // 使用原生SQL获取统计信息
    const stats = await req.enhancedStorage.db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) as totalUsers,
        (SELECT COUNT(*) FROM chat_rooms) as totalRooms,
        (SELECT COUNT(*) FROM messages) as totalMessages,
        (SELECT COUNT(*) FROM private_messages) as totalPrivateMessages,
        (SELECT COUNT(*) FROM friendships WHERE status = 'accepted') as totalFriendships,
        (SELECT COUNT(*) FROM user_presence WHERE status = 'online') as onlineUsers
    `);
    
    res.json(stats[0] || {});
  } catch (error) {
    console.error("获取系统统计失败:", error);
    res.status(500).json({ error: "获取系统统计失败" });
  }
});

// ============================================================================
// 健康检查
// ============================================================================

// 增强版存储健康检查
router.get("/api/enhanced/health", requireEnhancedStorage, async (req: any, res) => {
  try {
    // 测试数据库连接
    await req.enhancedStorage.testConnection();
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      storage: "enhanced-mysql",
      features: [
        "user-presence",
        "group-management", 
        "message-reactions",
        "push-notifications",
        "user-settings"
      ]
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export { router as enhancedRoutes, initializeEnhancedStorage };