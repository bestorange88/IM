import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// 安全校验
if (!process.env.DATABASE_URL) {
  throw new Error("❌ 缺少 DATABASE_URL，请检查 .env 文件是否配置正确");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql2", // ✅ 修正为 mysql2
  dbCredentials: {
    connectionString: process.env.DATABASE_URL, // ✅ 正确键名
  },
});
