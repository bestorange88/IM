import { eq, and, desc } from "drizzle-orm";
import { messages } from "./schema"; // 假设 schema.ts 中已或将定义 messages 表
import { Message } from "./types"; // 若无定义，我们也可创建基础类型结构

export class MessageService {
  constructor(private db: any) {}

  async sendMessage(senderId: string, roomId: string, content: string): Promise<void> {
    if (!senderId || !roomId || !content) {
      throw new Error("消息参数不完整");
    }

    try {
      await this.db.insert(messages).values({
        senderId,
        roomId,
        content,
        createdAt: new Date()
      });
      console.log("✅ 消息发送成功");
    } catch (error) {
      console.error("发送消息失败:", error);
      throw error;
    }
  }

  async getMessages(roomId: string): Promise<Message[]> {
    try {
      const rows = await this.db
        .select()
        .from(messages)
        .where(eq(messages.roomId, roomId))
        .orderBy(desc(messages.createdAt))
        .limit(50);

      return rows;
    } catch (error) {
      console.error("获取消息失败:", error);
      return [];
    }
  }
}