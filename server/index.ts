import dotenv from "dotenv";
dotenv.config(); // ✅ 确保优先加载 .env 配置

// 环境检测：开发环境使用PostgreSQL，生产环境强制使用MySQL
const originalDatabaseUrl = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  // 生产环境：强制使用MySQL（用户明确要求）
  process.env.DATABASE_URL = 'mysql://taishanguan:dasiwoyebushuo@localhost:3306/taishanguan';
  process.env.FORCE_MYSQL_STORAGE = 'true';
  process.env.DISABLE_MEMORY_STORAGE = 'true';
  console.log('🏭 生产环境：强制使用MySQL数据库（覆盖PostgreSQL）: mysql://taishanguan:***@localhost:3306/taishanguan');
} else {
  if (!originalDatabaseUrl) {
    // ✅ 如果开发环境未提供数据库连接，自动填默认值并打印警告
    console.warn('⚠️ 未检测到 DATABASE_URL，尝试使用默认开发数据库...');
    process.env.DATABASE_URL = 'mysql://taishanguan:dasiwoyebushuo@localhost:3306/taishanguan';
  }
  if (process.env.DATABASE_URL.includes('postgresql')) {
    console.log('🔧 开发环境：使用PostgreSQL数据库');
  } else {
    console.log('🔧 开发环境：尝试使用MySQL数据库');
  }
}

// ... 保留原始其他内容不变，继续用之前代码 ...

import express, { Request, Response, NextFunction } from "express";
import { requirePermission } from "./middleware/requirePermission";
import session from "express-session";
import { createServer as createHttpServer } from "http";
// import { WebSocketServer } from "ws";
import { setupSimpleRoutes } from "./simple-routes";
import { setupVite, serveStatic, log } from "./vite";
import { enhancedRoutes } from "./enhanced-routes";
import { initializeEnhancedStorage } from "./enhanced-storage-init";
// import { WebRTCSignalingServer } from "./webrtc";

// 确保Express应用对象全局可用且不被重命名
globalThis.expressApp = express();
const app = globalThis.expressApp;
console.log("✅ Express应用初始化成功");

// JSON 解析中间件
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session 中间件
app.use(
  session({
    secret: "taishan-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // ✅ 生产环境请设置为 true (需 HTTPS)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// API 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  const originalJson = res.json;
  res.json = function (body, ...args) {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let msg = `${req.method} ${path} ${res.statusCode} ${duration}ms`;
      try {
        const preview = JSON.stringify(body);
        if (preview.length < 200) msg += ` :: ${preview}`;
      } catch {}
      log(msg);
    }
    return originalJson.call(this, body, ...args);
  };

  next();
});

// 智能存储初始化
async function initializeStorage() {
  if (isProduction) {
    // 生产环境：必须使用MySQL（用户明确要求）
    console.log("🏭 生产环境：初始化MySQL存储系统");
    try {
      const { MySQLStorage } = await import("./storage");
      const storage = new MySQLStorage();
      
      // 测试MySQL连接
      console.log("🔍 测试MySQL连接...");
      await storage.getAllUsers();
      console.log("✅ 生产环境MySQL存储初始化成功");
      return storage;
    } catch (error) {
      console.error("❌ 生产环境MySQL连接失败:", (error as Error).message);
      console.error("错误详情:", error);
      
      // 生产环境MySQL连接失败时，抛出错误而不是回退
      throw new Error(`生产环境MySQL连接失败，请检查数据库配置: ${(error as Error).message}`);
    }
  } else {
    // 开发环境：优先使用PostgreSQL，备用MySQL
    if (originalDatabaseUrl && originalDatabaseUrl.includes('postgresql')) {
      console.log("🔧 开发环境：使用PostgreSQL存储");
      try {
        const { DatabaseStorage } = await import("./storage-postgres");
        const storage = new DatabaseStorage();
        await storage.getAllUsers(); // 测试连接
        console.log("✅ 开发环境PostgreSQL存储初始化成功");
        return storage;
      } catch (error) {
        console.error("⚠️ PostgreSQL连接失败，尝试MySQL:", (error as Error).message);
      }
    }
    
    // 开发环境备用：MySQL
    console.log("🔧 开发环境：尝试MySQL存储");
    try {
      const { MySQLStorage } = await import("./storage");
      const storage = new MySQLStorage();
      await storage.getAllUsers();
      console.log("✅ 开发环境MySQL存储初始化成功");
      return storage;
    } catch (error) {
      console.error("⚠️ MySQL连接失败，使用内存存储:", (error as Error).message);
      const { storage } = await import("./storage");
      return storage; // 使用现有的内存存储实例
    }
  }
}

(async () => {
  try {
    console.log("🔄 初始化应用，app类型:", typeof app, "app.use类型:", typeof app.use);
    
    if (!app || typeof app.use !== 'function') {
      throw new Error("Express应用初始化失败");
    }
    
    // 初始化存储系统
    const storage = await initializeStorage();
    
    console.log("✅ 开始设置简单路由");
    await setupSimpleRoutes(app, storage);
    console.log("✅ 泰山宫路由已配置完成");
    
    // 增强版存储初始化（仅开发环境）
    if (!isProduction) {
      try {
        console.log("正在连接增强版数据库...");
        const enhancedStorage = await initializeEnhancedStorage();
        console.log("✅ 增强存储系统初始化成功");
        
        // 启用增强版路由
        enhancedRoutes(app, enhancedStorage, storage);
        log("✅ 增强功能路由已启用");
      } catch (error) {
        console.log("⚠️ 增强功能初始化失败，使用基础功能:", (error as Error).message);
      }
    }
    
    // Vite 开发服务器必须在路由之后设置
    if (!isProduction) {
      await setupVite(app);
    }

    // 生产环境的静态文件服务
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    }

    const server = createHttpServer(app);
    
    // 错误处理中间件放置在所有路由之后
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("服务器异常：", err);
    });

    // 健康检查端点
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: '5.0',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // 启动服务 - 生产环境使用3000端口
    const port = process.env.NODE_ENV === 'production' ? 3000 : (Number(process.env.PORT) || 5000);
    server.listen(port, "0.0.0.0", () => {
      log(`🟢 服务器已启动：http://0.0.0.0:${port}`);
      if (process.env.NODE_ENV === 'production') {
        log(`🌐 生产环境外部访问：http://206.238.221.218:${port}`);
        log(`🔗 域名访问：https://im.1388.ink`);
        log(`💊 健康检查：http://localhost:${port}/health`);
      } else {
        log(`🧪 开发环境：http://localhost:${port}`);
      }
    });
  } catch (err) {
    console.error("服务器启动失败：", err);
    process.exit(1);
  }
})();