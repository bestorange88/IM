// 用户头像上传和个人资料管理路由
import { Express } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件！'));
    }
  }
});

export function setupUserRoutes(app: Express, storage: any, verifyToken: any) {
  // 头像上传
  app.post("/api/users/avatar", verifyToken, upload.single('avatar'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "请选择头像文件" });
      }
      
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      // 更新用户头像URL
      await storage.updateUserProfile(req.user.userId, { avatar: avatarUrl });
      
      res.json({ 
        message: "头像上传成功",
        avatarUrl: avatarUrl
      });
    } catch (err) {
      console.error("头像上传失败:", err);
      res.status(500).json({ error: "头像上传失败" });
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
}