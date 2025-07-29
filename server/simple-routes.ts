import express, { Request, Response, Express } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
// 存储实例将通过参数传递
let storageInstance: any = null;
// import { getAIResponse, isAIServiceAvailable, getAIServiceStatus } from "./ai-assistant";

const JWT_SECRET = process.env.JWT_SECRET || "taishan-palace-secret-key-2025";

// JWT 验证中间件
const verifyToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "未提供认证 token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err: any) {
    console.error("Token验证失败:", err.message, err.name);
    const isJWTError =
      err.name === "TokenExpiredError" || err.name === "JsonWebTokenError";
    return res.status(401).json({
      error: isJWTError ? "无效的 token" : "身份验证失败",
    });
  }
};

// 注册与登录验证 schema
const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  nickname: z.string().min(1).optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export function setupSimpleRoutes(app: Express, storage?: any) {
  // 设置存储实例
  if (storage) {
    storageInstance = storage;
  }
  
  // 获取存储实例（同步）
  function getStorage() {
    if (!storageInstance) {
      throw new Error("存储实例未初始化");
    }
    return storageInstance;
  }
  // 使用全局Express应用对象作为fallback
  const expressApp = app || (globalThis as any).expressApp;
  
  // 严格检查Express应用对象
  if (!expressApp || typeof expressApp !== 'function' || typeof expressApp.use !== 'function') {
    console.error("❌ Express应用对象无效:", { 
      app: !!expressApp, 
      type: typeof expressApp, 
      hasUse: !!(expressApp && typeof expressApp.use === 'function'),
      global: !!((globalThis as any).expressApp)
    });
    throw new Error("Express应用对象无效或未定义");
  }
  
  console.log("✅ 开始设置简单路由");
  expressApp.use("/api/auth", express.json({ limit: "10mb" }));
  
  // 所有路由都使用expressApp而不是app
  const router = expressApp;

  // 注册
  expressApp.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const storage = getStorage();
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) return res.status(400).json({ error: "用户名已存在" });

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`,
        username: data.username,
        password: hashedPassword,
        nickname: data.nickname || data.username,
        email: null,
      });

      const token = jwt.sign(
        { userId: user.id, username: user.username, nickname: user.nickname },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      (req.session as any).userId = user.id;

      res.json({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "数据验证失败", details: error.errors });
      }
      console.error("注册失败:", error);
      res.status(500).json({ error: "注册失败" });
    }
  });

  // 获取好友列表（道友）API
  expressApp.get("/api/friends", verifyToken, async (req, res) => {
    try {
      const storage = getStorage();
      const userId = (req as any).user.userId;
      
      console.log(`📋 API: 获取用户 ${userId} 的好友列表`);
      
      // 获取用户的真实好友
      const friends = await storage.getFriends(userId);
      
      // 添加系统默认联系人（迎客道人、泰山真人）
      let systemContacts = [];
      try {
        if (typeof storage.getSystemUsers === 'function') {
          systemContacts = await storage.getSystemUsers();
        } else {
          console.log("⚠️ Storage没有getSystemUsers方法，使用默认系统用户");
          // 提供默认系统用户
          systemContacts = [
            {
              id: 'system_yingkedaoren_001',
              username: 'yingkedaoren',
              nickname: '迎客道人',
              email: 'yingke@taishan.dao',
              password: null,
              avatar: '/avatars/yingke.jpg',
              status: '欢迎道友来到泰山宫',
              isOnline: true,
              lastSeen: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: 'system_taishanzhenen_001',
              username: 'taishanzhenen', 
              nickname: '泰山真人',
              email: 'zhenen@taishan.dao',
              password: null,
              avatar: '/avatars/zhenen.jpg',
              status: '道法自然，德泽众生',
              isOnline: true,
              lastSeen: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ];
        }
      } catch (systemError) {
        console.error("获取系统用户失败，使用默认数据:", systemError);
        systemContacts = [
          {
            id: 'system_yingkedaoren_001',
            username: 'yingkedaoren',
            nickname: '迎客道人',
            email: 'yingke@taishan.dao',
            password: null,
            avatar: '/avatars/yingke.jpg',
            status: '欢迎道友来到泰山宫',
            isOnline: true,
            lastSeen: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'system_taishanzhenen_001',
            username: 'taishanzhenen', 
            nickname: '泰山真人',
            email: 'zhenen@taishan.dao',
            password: null,
            avatar: '/avatars/zhenen.jpg',
            status: '道法自然，德泽众生',
            isOnline: true,
            lastSeen: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ];
      }
      
      // 合并好友和系统联系人
      const allContacts = [...friends, ...systemContacts];
      
      console.log(`✅ API: 返回 ${allContacts.length} 个联系人 (好友: ${friends.length}, 系统: ${systemContacts.length})`);
      
      res.json(allContacts);
    } catch (error) {
      console.error("❌ 获取好友列表失败:", error);
      res.status(500).json({ error: "获取好友列表失败", details: error.message });
    }
  });

  // 添加好友API
  expressApp.post("/api/friends", verifyToken, async (req, res) => {
    try {
      const storage = getStorage();
      const userId = (req as any).user.userId;
      const { friendId } = req.body;
      
      if (!friendId) {
        return res.status(400).json({ error: "缺少friendId参数" });
      }
      
      console.log(`🤝 API: 用户 ${userId} 添加好友 ${friendId}`);
      
      // 检查目标用户是否存在
      const targetUser = await storage.getUser(friendId);
      if (!targetUser) {
        return res.status(404).json({ error: "目标用户不存在" });
      }
      
      // 添加好友关系
      await storage.addFriend(userId, friendId);
      
      console.log(`✅ API: 好友添加成功 ${userId} -> ${friendId}`);
      res.json({ message: "好友添加成功", friend: targetUser });
    } catch (error) {
      console.error("❌ 添加好友失败:", error);
      res.status(500).json({ error: "添加好友失败", details: error.message });
    }
  });

  // 搜索用户API
  expressApp.get("/api/users/search", verifyToken, async (req, res) => {
    try {
      const storage = getStorage();
      const { q: query } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "缺少搜索参数q" });
      }
      
      console.log(`🔍 API: 搜索用户 "${query}"`);
      
      const results = await storage.searchUsers(query.trim());
      
      console.log(`✅ API: 找到 ${results.length} 个搜索结果`);
      res.json(results);
    } catch (error) {
      console.error("❌ 搜索用户失败:", error);
      res.status(500).json({ error: "搜索用户失败", details: error.message });
    }
  });

  // 登录路由
  expressApp.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const storage = getStorage();
      const user = await storage.getUserByUsername(username);
      
      if (!user || !await bcrypt.compare(password, user.password!)) {
        return res.status(401).json({ error: "用户名或密码错误" });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username, nickname: user.nickname },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        token,
      });
    } catch (error) {
      console.error("登录失败:", error);
      res.status(500).json({ error: "登录失败" });
    }
  });

  // 兼容旧的登录路由
  expressApp.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const storage = getStorage();
      const user = await storage.getUserByUsername(data.identifier);
      if (!user) return res.status(401).json({ error: "用户不存在" });

      const valid = await bcrypt.compare(data.password, user.password || "");
      if (!valid) return res.status(401).json({ error: "密码错误" });

      const token = jwt.sign(
        { userId: user.id, username: user.username, nickname: user.nickname },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      (req.session as any).userId = user.id;

      res.json({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "数据验证失败", details: error.errors });
      }
      console.error("登录失败:", error);
      res.status(500).json({ error: "登录失败" });
    }
  });

  // 获取当前用户信息
  expressApp.get("/api/auth/user", async (req, res) => {
    try {
      let userId = null;
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.userId;
        } catch {
          return res.status(401).json({ error: "无效的 token" });
        }
      } else {
        userId = (req.session as any)?.userId;
      }

      if (!userId) return res.status(401).json({ error: "未登录" });

      const storage = getStorage();
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "用户不存在" });

      res.json({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        status: user.status,
        isOnline: user.isOnline,
      });
    } catch (error) {
      console.error("获取用户信息失败:", error);
      res.status(500).json({ error: "获取用户信息失败" });
    }
  });

  // 获取联系人（好友）
  expressApp.get("/api/users", verifyToken, async (req, res) => {
    try {
      const currentUserId = (req as any).user.userId;
      console.log("获取用户好友列表，用户ID:", currentUserId);
      
      const storage = getStorage();
      const friends = await storage.getFriends(currentUserId);
      console.log("好友列表数量:", friends.length);
      
      // 确保不返回密码字段
      const safeFriends = friends.map(friend => ({
        id: friend.id,
        username: friend.username,
        nickname: friend.nickname,
        email: friend.email,
        avatar: friend.avatar,
        status: friend.status,
        isOnline: friend.isOnline,
        lastSeen: friend.lastSeen,
      }));
      
      res.json(safeFriends);
    } catch (error) {
      console.error("获取好友列表失败:", error);
      res.status(500).json({ error: "获取好友列表失败" });
    }
  });

  // 搜索用户
  expressApp.get("/api/users/search", verifyToken, async (req, res) => {
    try {
      const query = req.query.q as string;
      console.log("收到搜索请求，查询词:", query);
      
      if (!query || query.trim().length === 0) {
        console.log("查询词为空，返回空数组");
        return res.json([]);
      }

      const storage = getStorage();
      const users = await storage.searchUsers(query);
      console.log("搜索结果数量:", users.length);
      
      // 不返回密码字段
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        isOnline: user.isOnline
      }));
      
      console.log("返回安全用户数据:", JSON.stringify(safeUsers, null, 2));
      res.json(safeUsers);
    } catch (error) {
      console.error("搜索用户失败:", error);
      res.status(500).json({ error: "搜索用户失败" });
    }
  });

  // 添加好友
  expressApp.post("/api/friends", verifyToken, async (req, res) => {
    try {
      console.log("添加好友请求体:", JSON.stringify(req.body, null, 2));
      
      const { friendId, searchQuery } = req.body;
      const currentUserId = (req as any).user.userId;
      
      console.log("当前用户ID:", currentUserId);
      console.log("目标好友ID:", friendId);
      console.log("搜索查询:", searchQuery);
      
      let targetFriendId = friendId;
      
      // 如果提供搜索查询，先查找用户
      if (searchQuery && !friendId) {
        const storage = getStorage();
        const users = await storage.searchUsers(searchQuery);
        if (users.length === 0) {
          return res.status(404).json({ error: "未找到匹配的用户" });
        }
        
        // 如果有多个匹配结果，返回选择列表
        if (users.length > 1) {
          const safeUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            nickname: user.nickname,
            email: user.email,
            avatar: user.avatar
          }));
          return res.json({ multiple: true, users: safeUsers });
        }
        
        targetFriendId = users[0].id;
      }
      
      if (!targetFriendId) {
        console.log("错误: 缺少好友ID");
        return res.status(400).json({ error: "请提供用户ID或搜索信息" });
      }

      if (targetFriendId === currentUserId) {
        return res.status(400).json({ error: "不能添加自己为好友" });
      }

      // 验证目标用户存在
      const storage = getStorage();
      const targetUser = await storage.getUser(targetFriendId);
      if (!targetUser) {
        console.log("错误: 目标用户不存在:", targetFriendId);
        return res.status(404).json({ error: "目标用户不存在" });
      }

      console.log("目标用户信息:", targetUser.nickname || targetUser.username);
      
      await storage.addFriend(currentUserId, targetFriendId);
      
      const response = { 
        success: true, 
        message: `成功添加 ${targetUser.nickname || targetUser.username} 为好友`,
        user: {
          id: targetUser.id,
          username: targetUser.username,
          nickname: targetUser.nickname,
          avatar: targetUser.avatar
        }
      };
      
      console.log("添加好友成功，返回:", JSON.stringify(response, null, 2));
      res.json(response);
    } catch (error: any) {
      console.error("添加好友失败:", error);
      console.error("错误详情:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      res.status(500).json({ 
        error: "添加好友失败",
        detail: error?.message || "未知错误",
        code: error?.code || "UNKNOWN"
      });
    }
  });

  // 获取聊天室列表
  expressApp.get("/api/chat/rooms", verifyToken, async (req, res) => {
    try {
      const storage = getStorage();
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("获取聊天室列表失败:", error);
      res.status(500).json({ error: "获取聊天室列表失败" });
    }
  });

  // 获取房间消息
  expressApp.get("/api/chat/rooms/:roomId/messages", verifyToken, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const limit = parseInt(req.query.limit as string) || 50;
      const storage = getStorage();
      const messages = await storage.getRoomMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      console.error("获取房间消息失败:", error);
      res.status(500).json({ error: "获取房间消息失败" });
    }
  });

  // 发送消息
  expressApp.post("/api/chat/rooms/:roomId/messages", verifyToken, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const { content, type = "text" } = req.body;
      const userId = (req as any).user.userId;

      if (!content || typeof content !== "string") {
        return res.status(400).json({ error: "消息内容不能为空" });
      }

      const storage = getStorage();
      const message = await storage.createMessage({
        content,
        type,
        senderId: userId,
        roomId,
      });

      const messageWithUser = await storage.getMessageWithUser(message.id);
      res.json(messageWithUser);
    } catch (error) {
      console.error("发送消息失败:", error);
      res.status(500).json({ error: "发送消息失败" });
    }
  });

  // AI 助手慧心
  expressApp.post("/api/ai/chat", verifyToken, async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "消息内容不能为空" });
      }

      // 简单的AI响应占位符
      const aiResponse = `慧心道人回复：感谢您的问询"${message}"。道法自然，愿您修行精进。`;
      res.json({
        response: aiResponse,
        available: true,
        error: null,
      });
    } catch (error) {
      console.error("AI 助手错误:", error);
      res.status(500).json({ error: "AI 助手暂时不可用" });
    }
  });

  // AI 助手状态
  expressApp.get("/api/ai/status", async (req, res) => {
    try {
      const status = {
        available: true,
        status: "online",
        name: "慧心道人",
        description: "泰山宫智能助手"
      };
      res.json(status);
    } catch (error) {
      console.error("获取 AI 状态失败:", error);
      res.status(500).json({ error: "获取 AI 状态失败" });
    }
  });

  // 创建聊天室
  expressApp.post("/api/chat/rooms", verifyToken, async (req, res) => {
    try {
      const { name, description, type = "group" } = req.body;
      const userId = (req as any).user.userId;

      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "房间名称不能为空" });
      }

      const storage = getStorage();
      const room = await storage.createChatRoom({
        name,
        description,
        type,
      });

      // 创建者自动加入房间
      await storage.addRoomMember({
        roomId: room.id,
        userId,
        role: "admin",
      });

      res.json(room);
    } catch (error) {
      console.error("创建聊天室失败:", error);
      res.status(500).json({ error: "创建聊天室失败" });
    }
  });

  // 加入聊天室
  expressApp.post("/api/chat/rooms/:roomId/join", verifyToken, async (req, res) => {
    try {
      const roomId = parseInt(req.params.roomId);
      const userId = (req as any).user.userId;

      const storage = getStorage();
      const member = await storage.addRoomMember({
        roomId,
        userId,
        role: "member",
      });

      res.json(member);
    } catch (error) {
      console.error("加入聊天室失败:", error);
      res.status(500).json({ error: "加入聊天室失败" });
    }
  });

  // 存储状态检测API
  expressApp.get("/api/storage/status", async (req, res) => {
    try {
      const storage = getStorage();
      const users = await storage.getAllUsers();
      
      // 检测存储类型
      const storageType = storage.constructor.name;
      const isMemoryStorage = storageType === 'MemStorage';
      const isMySQLStorage = storageType === 'MySQLStorage';
      
      res.json({
        message: "存储系统状态检查",
        timestamp: new Date().toISOString(),
        userCount: users.length,
        status: "healthy",
        storageType: storageType,
        storageInfo: isMemoryStorage ? "内存存储" : isMySQLStorage ? "MySQL存储" : "其他存储",
        databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : "未设置",
        isMySQL: isMySQLStorage,
        isMemory: isMemoryStorage
      });
    } catch (error: any) {
      res.status(500).json({
        error: "存储系统检查失败",
        message: error.message,
        storageError: "存储系统初始化失败"
      });
    }
  });

  console.log("✅ 泰山宫路由已配置完成");
}