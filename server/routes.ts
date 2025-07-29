import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { storage } from "./storage";
import { loginSchema, registerSchema } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "taishan-palace-secret-key-2025";

// JWT 验证中间件
const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "未提供认证 token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err: any) {
    const isJWTError =
      err.name === "TokenExpiredError" || err.name === "JsonWebTokenError";
    return res.status(401).json({
      error: isJWTError ? "无效或过期的 token" : "身份验证失败",
    });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api", express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // 注册
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("注册请求数据:", req.body);
      const data = registerSchema.parse(req.body);
      console.log("解析后数据:", data);
      
      const existingUser = await (await storage()).getUserByUsername(data.username);
      if (existingUser) return res.status(400).json({ error: "用户名已存在" });

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await (await storage()).createUser({
        username: data.username,
        password: hashedPassword,
        nickname: data.nickname || data.username,
        email: data.email || null,
        avatar: null,
        isOnline: false,
      });

      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          nickname: user.nickname
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname || user.username,
          email: user.email,
          avatar: user.avatar || "/default-avatar.png",
        },
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

  // 登录
  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("登录请求数据:", req.body);
      const data = loginSchema.parse(req.body);
      const identifier = data.identifier || data.username;
      console.log("使用标识符:", identifier);
      const user = await (await storage()).getUserByUsername(identifier);
      if (!user) return res.status(401).json({ error: "用户不存在" });

      const valid = await bcrypt.compare(data.password, user.password || "");
      if (!valid) return res.status(401).json({ error: "密码错误" });

      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          nickname: user.nickname
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      await (await storage()).updateUserStatus(user.id, "online");

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname || user.username,
          email: user.email,
          avatar: user.avatar || "/default-avatar.png",
        },
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
  app.get("/api/auth/user", verifyToken, async (req: any, res) => {
    try {
      const user = await (await storage()).getUser(req.user.userId);
      if (!user) return res.status(404).json({ error: "用户不存在" });

      res.json({
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        email: user.email,
        avatar: user.avatar || "/default-avatar.png",
        status: user.status || "offline",
        isOnline: user.isOnline || false,
      });
    } catch (err) {
      console.error("获取用户失败:", err);
      res.status(500).json({ error: "获取用户失败" });
    }
  });

  // 获取当前用户信息 (别名路由)
  app.get("/api/auth/me", verifyToken, async (req: any, res) => {
    try {
      const user = await (await storage()).getUser(req.user.userId);
      if (!user) return res.status(404).json({ error: "用户不存在" });

      res.json({
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        email: user.email,
        avatar: user.avatar || "/default-avatar.png",
        status: user.status || "online",
        isOnline: user.isOnline || false,
      });
    } catch (err) {
      console.error("获取用户失败:", err);
      res.status(500).json({ error: "获取用户失败" });
    }
  });

  // 登出
  app.post("/api/auth/logout", verifyToken, async (req: any, res) => {
    try {
      await (await storage()).updateUserStatus(req.user.userId, "offline");
      res.json({ message: "登出成功" });
    } catch (err) {
      console.error("登出失败:", err);
      res.status(500).json({ error: "登出失败" });
    }
  });

  // ================= 用户管理 =================
  // 获取所有用户（通讯录）
  app.get("/api/users", verifyToken, async (req: any, res) => {
    try {
      const allUsers = await (await storage()).getAllUsers();
      // 过滤掉当前用户，返回其他用户作为通讯录
      const contacts = allUsers
        .filter(user => user.id !== req.user.userId)
        .map(user => ({
          id: user.id,
          username: user.username,
          nickname: user.nickname || user.username,
          email: user.email,
          avatar: user.avatar || "/default-avatar.png",
          status: user.status || "offline",
          isOnline: user.isOnline || false,
          lastSeen: user.lastSeen,
        }));
      
      res.json(contacts);
    } catch (err) {
      console.error("获取用户列表失败:", err);
      res.status(500).json({ error: "获取用户列表失败" });
    }
  });

  // 获取好友列表（道友）
  app.get("/api/friends", verifyToken, async (req: any, res) => {
    try {
      console.log(`📋 API: 获取用户 ${req.user.userId} 的好友列表`);
      const friends = await (await storage()).getFriends(req.user.userId);
      console.log(`✅ API: 返回 ${friends.length} 个好友`);
      res.json(friends);
    } catch (err) {
      console.error("获取好友列表失败:", err);
      res.status(500).json({ error: "获取好友列表失败" });
    }
  });

  // 添加好友
  app.post("/api/friends", verifyToken, async (req: any, res) => {
    try {
      const { friendId } = req.body;
      
      if (!friendId) {
        return res.status(400).json({ error: "好友ID不能为空" });
      }
      
      if (friendId === req.user.userId) {
        return res.status(400).json({ error: "不能添加自己为好友" });
      }
      
      console.log(`📝 API: 用户 ${req.user.userId} 添加好友 ${friendId}`);
      await (await storage()).addFriend(req.user.userId, friendId);
      
      res.json({ message: "好友添加成功" });
    } catch (err) {
      console.error("添加好友失败:", err);
      res.status(500).json({ error: "添加好友失败" });
    }
  });

  // ================= 聊天室 =================
  app.get("/api/rooms", verifyToken, async (_req, res) => {
    try {
      const rooms = await (await storage()).getChatRooms();
      res.json(rooms);
    } catch (err) {
      console.error("获取聊天室失败:", err);
      res.status(500).json({ error: "获取聊天室失败" });
    }
  });

  // 聊天室路由别名
  app.get("/api/chat/rooms", verifyToken, async (_req, res) => {
    try {
      console.log("📋 API: 获取聊天室列表");
      const rooms = await (await storage()).getChatRooms();
      console.log(`✅ API: 返回 ${rooms.length} 个聊天室`);
      res.json(rooms);
    } catch (err) {
      console.error("获取聊天室失败:", err);
      res.status(500).json({ error: "获取聊天室失败", details: err.message });
    }
  });

  // 创建聊天室
  app.post("/api/chat/rooms", verifyToken, async (req: any, res) => {
    try {
      const { name, description, type = "group" } = req.body;
      
      if (!name?.trim()) {
        return res.status(400).json({ error: "聊天室名称不能为空" });
      }
      
      console.log(`📝 API: 创建聊天室 ${name}`);
      const room = await (await storage()).createChatRoom({
        name: name.trim(),
        description: description?.trim() || "",
        type,
        createdBy: req.user.userId,
      });
      
      console.log(`✅ API: 聊天室创建成功，ID: ${room.id}`);
      res.json(room);
    } catch (err) {
      console.error("创建聊天室失败:", err);
      res.status(500).json({ error: "创建聊天室失败", details: err.message });
    }
  });

  app.get("/api/rooms/:id/messages", verifyToken, async (req, res) => {
    try {
      const messages = await storage.getRoomMessages(
        Number(req.params.id),
        100
      );
      res.json(messages);
    } catch (err) {
      console.error("获取消息失败:", err);
      res.status(500).json({ error: "获取消息失败" });
    }
  });

  app.post("/api/rooms/:id/messages", verifyToken, async (req: any, res) => {
    try {
      const { content, type = "text" } = req.body;

      if (!content?.trim()) {
        return res.status(400).json({ error: "消息内容不能为空" });
      }

      const message = await storage.createMessage({
        content: content.trim(),
        type,
        roomId: Number(req.params.id),
        senderId: req.user.userId,
      });

      const fullMessage = await storage.getMessageWithUser(message.id);
      res.json(fullMessage);
    } catch (err) {
      console.error("发送消息失败:", err);
      res.status(500).json({ error: "发送消息失败" });
    }
  });

  // 用户搜索API
  app.get("/api/users/search", verifyToken, async (req: any, res) => {
    try {
      const { query } = req.query;
      
      if (!query?.trim()) {
        return res.status(400).json({ error: "搜索查询不能为空" });
      }
      
      console.log(`🔍 API: 搜索用户 "${query}"`);
      const users = await storage.searchUsers(query);
      
      // 排除当前用户和移除密码字段
      const results = users
        .filter(user => user.id !== req.user.userId)
        .map(user => ({
          id: user.id,
          username: user.username,
          nickname: user.nickname || user.username,
          email: user.email,
          avatar: user.avatar || "/default-avatar.png",
          status: user.status || "offline",
          isOnline: user.isOnline || false,
        }));
      
      console.log(`✅ API: 找到 ${results.length} 个用户`);
      res.json(results);
    } catch (err) {
      console.error("搜索用户失败:", err);
      res.status(500).json({ error: "搜索用户失败" });
    }
  });

  // 用户头像上传（简化版，不使用multer）
  app.post("/api/users/avatar", verifyToken, async (req: any, res) => {
    try {
      const { avatarUrl } = req.body;
      
      if (!avatarUrl) {
        return res.status(400).json({ error: "头像URL不能为空" });
      }
      
      await storage.updateUserProfile(req.user.userId, { avatar: avatarUrl });
      
      res.json({ 
        message: "头像更新成功",
        avatarUrl: avatarUrl
      });
    } catch (err) {
      console.error("头像更新失败:", err);
      res.status(500).json({ error: "头像更新失败" });
    }
  });

  // 更新用户资料
  app.put("/api/users/profile", verifyToken, async (req: any, res) => {
    try {
      const { nickname, email, status } = req.body;
      
      const updates: any = {};
      if (nickname) updates.nickname = nickname.trim();
      if (email) updates.email = email.trim();
      if (status) updates.status = status.trim();
      
      await storage.updateUserProfile(req.user.userId, updates);
      
      res.json({ message: "资料更新成功" });
    } catch (err) {
      console.error("资料更新失败:", err);
      res.status(500).json({ error: "资料更新失败" });
    }
  });

  // 获取用户资料
  app.get("/api/users/profile", verifyToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "用户不存在" });
      }
      
      // 不返回密码
      const { password, ...profile } = user;
      res.json(profile);
    } catch (err) {
      console.error("获取用户资料失败:", err);
      res.status(500).json({ error: "获取用户资料失败" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
