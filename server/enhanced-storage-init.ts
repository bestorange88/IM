import { EnhancedMySQLStorage } from "./enhanced-mysql-storage";

let enhancedStorage: EnhancedMySQLStorage | null = null;

// 初始化增强存储
export function initializeEnhancedStorage(databaseUrl: string) {
  try {
    enhancedStorage = new EnhancedMySQLStorage(databaseUrl);
    console.log("✅ 增强存储系统初始化成功");
    return enhancedStorage;
  } catch (error) {
    console.error("❌ 增强存储系统初始化失败:", error);
    return null;
  }
}

// 获取增强存储实例
export function getEnhancedStorage(): EnhancedMySQLStorage | null {
  return enhancedStorage;
}