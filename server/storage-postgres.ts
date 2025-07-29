// PostgreSQL适配存储 - 仅用于Replit开发环境
// 生产环境必须使用MySQL（用户要求）
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { eq, and, or } from "drizzle-orm";
import type { IStorage, User, InsertUser, ChatRoom, InsertChatRoom, Message, InsertMessage, MessageWithUser, PrivateMessage, InsertPrivateMessage, RoomMember, InsertRoomMember, FileAttachment, InsertFileAttachment } from "./storage";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema, mode: 'default' });

export class DatabaseStorage implements IStorage {
  private db = db;

  constructor() {
    console.log("🔄 初始化PostgreSQL存储（开发环境）- 生产环境将使用MySQL");
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.db.select().from(schema.users);
    } catch (error) {
      console.error("获取所有用户失败:", error);
      return [];
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await this.db.insert(schema.users).values({
        ...user,
        id: userId,
        status: "offline",
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await this.getUser(userId);
      if (!result) throw new Error("用户创建失败");
      return result;
    } catch (error) {
      console.error("创建用户失败:", error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    try {
      await this.db.update(schema.users)
        .set({ status, lastSeen: new Date(), updatedAt: new Date() })
        .where(eq(schema.users.id, userId));
    } catch (error) {
      console.error("更新用户状态失败:", error);
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      console.log(`📝 更新用户 ${userId} 的资料:`, updates);
      await this.db
        .update(schema.users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.users.id, userId));
      console.log(`✅ 用户资料更新成功`);
    } catch (error) {
      console.error("❌ 更新用户资料失败:", error);
      throw error;
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    try {
      return await this.db.select().from(schema.users).where(eq(schema.users.isOnline, true));
    } catch (error) {
      console.error("获取在线用户失败:", error);
      return [];
    }
  }

  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      console.log("📋 存储层: 获取聊天室列表");
      const result = await this.db.select().from(schema.chatRooms);
      console.log(`✅ 存储层: 找到 ${result.length} 个聊天室`);
      return result;
    } catch (error) {
      console.error("❌ 存储层: 获取聊天室失败:", error);
      throw error;
    }
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    try {
      console.log("📝 存储层: 创建聊天室", room);
      const result = await this.db.insert(schema.chatRooms).values({
        ...room,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      console.log(`✅ 存储层: 聊天室创建成功，ID: ${result[0].id}`);
      return result[0];
    } catch (error) {
      console.error("❌ 存储层: 创建聊天室失败:", error);
      throw error;
    }
  }

  async addRoomMember(member: InsertRoomMember): Promise<RoomMember> {
    try {
      await this.db.insert(schema.roomMembers).values({
        ...member,
        joinedAt: new Date(),
      });

      const [created] = await this.db
        .select()
        .from(schema.roomMembers)
        .where(eq(schema.roomMembers.userId, member.userId))
        .limit(1);

      if (!created) throw new Error("加入聊天室失败");
      return created;
    } catch (error) {
      console.error("添加房间成员失败:", error);
      throw error;
    }
  }

  async getRoomMessages(roomId: number, limit = 100): Promise<MessageWithUser[]> {
    try {
      const rows = await this.db
        .select({
          id: schema.messages.id,
          content: schema.messages.content,
          type: schema.messages.type,
          roomId: schema.messages.roomId,
          senderId: schema.messages.senderId,
          createdAt: schema.messages.createdAt,
          updatedAt: schema.messages.updatedAt,
          user: {
            id: schema.users.id,
            username: schema.users.username,
            nickname: schema.users.nickname,
            avatar: schema.users.avatar,
          },
        })
        .from(schema.messages)
        .innerJoin(schema.users, eq(schema.messages.senderId, schema.users.id))
        .where(eq(schema.messages.roomId, roomId))
        .orderBy(schema.messages.createdAt)
        .limit(limit);

      return rows;
    } catch (error) {
      console.error("获取房间消息失败:", error);
      return [];
    }
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      const result = await this.db.insert(schema.messages).values({
        ...message,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      if (!result[0]) throw new Error("消息创建失败");
      return result[0];
    } catch (error) {
      console.error("创建消息失败:", error);
      throw error;
    }
  }

  async getMessageWithUser(messageId: number): Promise<MessageWithUser> {
    try {
      const result = await this.db
        .select({
          id: schema.messages.id,
          content: schema.messages.content,
          type: schema.messages.type,
          roomId: schema.messages.roomId,
          senderId: schema.messages.senderId,
          createdAt: schema.messages.createdAt,
          updatedAt: schema.messages.updatedAt,
          user: {
            id: schema.users.id,
            username: schema.users.username,
            nickname: schema.users.nickname,
            avatar: schema.users.avatar,
          },
        })
        .from(schema.messages)
        .innerJoin(schema.users, eq(schema.messages.senderId, schema.users.id))
        .where(eq(schema.messages.id, messageId))
        .limit(1);

      if (!result[0]) throw new Error("消息不存在");
      return result[0];
    } catch (error) {
      console.error("获取消息失败:", error);
      throw error;
    }
  }

  async getFriends(userId: string): Promise<User[]> {
    try {
      console.log(`📋 获取用户 ${userId} 的好友列表...`);
      
      const result = await this.db
        .select({
          id: schema.users.id,
          username: schema.users.username,
          nickname: schema.users.nickname,
          email: schema.users.email,
          avatar: schema.users.avatar,
          status: schema.users.status,
          isOnline: schema.users.isOnline,
          lastSeen: schema.users.lastSeen,
          createdAt: schema.users.createdAt,
          updatedAt: schema.users.updatedAt,
          password: schema.users.password, // 后续会过滤掉
        })
        .from(schema.friendships)
        .innerJoin(schema.users, eq(schema.friendships.friendId, schema.users.id))
        .where(and(
          eq(schema.friendships.userId, userId),
          eq(schema.friendships.status, 'accepted')
        ));

      console.log(`✅ 找到 ${result.length} 个好友`);
      
      // 移除密码字段
      return result.map(({ password, ...user }) => user as User);
    } catch (error) {
      console.error("❌ 获取好友列表失败:", error);
      return [];
    }
  }

  async addFriend(userId: string, friendId: string): Promise<void> {
    try {
      console.log(`用户 ${userId} 添加好友 ${friendId}`);
      
      // 检查好友关系是否已存在
      const existing = await this.db
        .select()
        .from(schema.friendships)
        .where(and(
          eq(schema.friendships.userId, userId),
          eq(schema.friendships.friendId, friendId)
        ))
        .limit(1);

      if (existing.length > 0) {
        console.log("好友关系已存在，跳过添加");
        return;
      }

      // 添加双向好友关系
      await this.db.insert(schema.friendships).values([
        {
          userId: userId,
          friendId: friendId,
          status: 'accepted',
          requestedBy: userId,
        },
        {
          userId: friendId,
          friendId: userId,
          status: 'accepted',
          requestedBy: userId,
        }
      ]);

      console.log(`✅ 好友关系已建立: ${userId} <-> ${friendId}`);
    } catch (error: any) {
      console.error("添加好友失败 - PostgreSQL存储层:", error);
      throw new Error(`数据库操作失败: ${error?.message || '未知错误'}`);
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      if (!query?.trim()) {
        console.log("搜索查询为空，返回空结果");
        return [];
      }

      const result = await this.db
        .select()
        .from(schema.users)
        .where(
          or(
            eq(schema.users.username, query.trim()),
            eq(schema.users.email, query.trim()),
            eq(schema.users.nickname, query.trim())
          )
        )
        .limit(20);

      return result;
    } catch (error) {
      console.error("搜索用户失败:", error);
      return [];
    }
  }

  // 获取系统默认用户（迎客道人、泰山真人）
  async getSystemUsers(): Promise<User[]> {
    try {
      console.log("🏛️ PostgreSQL: 获取系统默认联系人...");
      
      // 查找系统用户
      const systemUsers = await this.db
        .select()
        .from(schema.users)
        .where(or(
          eq(schema.users.username, 'yingkedaoren'),
          eq(schema.users.username, 'taishanzhenen'),
          eq(schema.users.nickname, '迎客道人'),
          eq(schema.users.nickname, '泰山真人')
        ));

      if (systemUsers.length > 0) {
        console.log(`✅ PostgreSQL找到 ${systemUsers.length} 个系统用户`);
        return systemUsers.map(user => ({ ...user, password: null })) as User[];
      }

      // 如果没有系统用户，创建默认系统用户
      console.log("💫 PostgreSQL: 创建系统默认用户...");
      
      const defaultUsers = [
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

      // 尝试插入系统用户到PostgreSQL
      const createdUsers: User[] = [];
      for (const defaultUser of defaultUsers) {
        try {
          const [created] = await this.db.insert(schema.users).values(defaultUser).returning();
          if (created) {
            createdUsers.push({ ...created, password: null } as User);
            console.log(`✅ PostgreSQL创建系统用户: ${defaultUser.nickname}`);
          }
        } catch (error: any) {
          // 如果用户已存在，尝试查询
          if (error.message?.includes('duplicate') || error.code === '23505') {
            console.log(`⚠️ PostgreSQL系统用户已存在: ${defaultUser.nickname}`);
            try {
              const [existing] = await this.db
                .select()
                .from(schema.users)
                .where(eq(schema.users.username, defaultUser.username))
                .limit(1);
              if (existing) {
                createdUsers.push({ ...existing, password: null } as User);
              }
            } catch (selectError) {
              console.error(`查询现有用户失败: ${defaultUser.nickname}`, selectError);
            }
          } else {
            console.error(`❌ PostgreSQL创建系统用户失败: ${defaultUser.nickname}`, error);
          }
        }
      }

      // 如果创建成功，返回创建的用户；否则返回默认数据
      if (createdUsers.length > 0) {
        return createdUsers;
      }

      // 备选方案：返回硬编码的系统用户数据
      return defaultUsers.map(user => ({ ...user, password: null })) as User[];
    } catch (error) {
      console.error("❌ PostgreSQL获取系统用户失败:", error);
      // 返回硬编码的系统用户作为备选方案
      return [
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
          updatedAt: new Date(),
          createdAt: new Date(),
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
          updatedAt: new Date(),
          createdAt: new Date(),
        }
      ] as User[];
    }
  }

  // 简化实现其他必需方法
  async getPrivateMessages(): Promise<PrivateMessage[]> { return []; }
  async createPrivateMessage(): Promise<PrivateMessage> { throw new Error("Not implemented"); }
  async getFileAttachments(): Promise<FileAttachment[]> { return []; }
  async createFileAttachment(): Promise<FileAttachment> { throw new Error("Not implemented"); }
  async sendFriendRequest(): Promise<void> {}
  async acceptFriendRequest(): Promise<void> {}
  async declineFriendRequest(): Promise<void> {}
  async blockUser(): Promise<void> {}
  async unblockUser(): Promise<void> {}
  async searchMessages(): Promise<MessageWithUser[]> { return []; }
}