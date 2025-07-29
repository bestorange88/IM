import { eq, like, or, desc, asc, and } from "drizzle-orm";
import { db } from "./db";
import bcrypt from "bcrypt";
import { users, chatRooms, messages, roomMembers, sessions, type User, type InsertUser, type ChatRoom, type InsertChatRoom, type Message, type InsertMessage, type RoomMember, type InsertRoomMember } from "@shared/schema";

// 存储接口定义
interface IStorage {
  // 用户相关
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  searchUsers(searchTerm: string): Promise<User[]>;

  // 聊天室相关
  getAllRooms(): Promise<ChatRoom[]>;
  getRoom(id: number): Promise<ChatRoom | undefined>;
  createRoom(insertRoom: InsertChatRoom): Promise<ChatRoom>;
  getRoomMembers(roomId: number): Promise<User[]>;
  addUserToRoom(userId: number, roomId: number): Promise<void>;
  removeUserFromRoom(userId: number, roomId: number): Promise<void>;

  // 消息相关
  getMessages(roomId: number, limit?: number): Promise<Message[]>;
  createMessage(insertMessage: InsertMessage): Promise<Message>;

  // 会话相关
  createSession(sessionId: string, userId: number): Promise<void>;
  getSession(sessionId: string): Promise<{ userId: number } | undefined>;
  deleteSession(sessionId: string): Promise<void>;
}

// PostgreSQL/Neon数据库存储实现
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, String(id)));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // 检查用户名是否已存在
    const existingUser = await this.getUserByUsername(insertUser.username);
    if (existingUser) {
      throw new Error("用户名已存在");
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (insertUser.email) {
      const existingEmail = await this.getUserByEmail(insertUser.email);
      if (existingEmail) {
        throw new Error("邮箱已被使用");
      }
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    // 生成用户ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const userToCreate = {
      id: userId,
      username: insertUser.username,
      nickname: insertUser.nickname,
      email: insertUser.email,
      password: hashedPassword,
      avatar: insertUser.avatar || '/default-avatar.png',
      status: "online",
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const [user] = await db.insert(users).values(userToCreate).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select({
      id: users.id,
      username: users.username,
      nickname: users.nickname,
      email: users.email,
      avatar: users.avatar,
      status: users.status,
      isOnline: users.isOnline,
      lastSeen: users.lastSeen,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).orderBy(asc(users.createdAt));
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    const term = `%${searchTerm.toLowerCase()}%`;
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        nickname: users.nickname,
        email: users.email,
        avatar: users.avatar,
        status: users.status,
        isOnline: users.isOnline,
        lastSeen: users.lastSeen,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(
        or(
          like(users.username, term),
          like(users.nickname, term),
          like(users.email, term)
        )
      )
      .limit(20);
    
    return result;
  }

  async getAllRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms).orderBy(asc(chatRooms.id));
  }

  async getRoom(id: number): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room || undefined;
  }

  async createRoom(insertRoom: InsertChatRoom): Promise<ChatRoom> {
    const [room] = await db.insert(chatRooms).values(insertRoom).returning();
    return room;
  }

  async getRoomMembers(roomId: number): Promise<User[]> {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        nickname: users.nickname,
        email: users.email,
        avatar: users.avatar,
        status: users.status,
        isOnline: users.isOnline,
        lastSeen: users.lastSeen,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(roomMembers)
      .innerJoin(users, eq(roomMembers.userId, users.id))
      .where(eq(roomMembers.roomId, roomId));
    
    return result;
  }

  async addUserToRoom(userId: number, roomId: number): Promise<void> {
    // 检查是否已经是成员
    const existing = await db
      .select()
      .from(roomMembers)
      .where(and(eq(roomMembers.userId, String(userId)), eq(roomMembers.roomId, roomId)));
    
    if (existing.length === 0) {
      await db.insert(roomMembers).values({ 
        userId: String(userId), 
        roomId,
        role: "member",
        joinedAt: new Date()
      });
    }
  }

  async removeUserFromRoom(userId: number, roomId: number): Promise<void> {
    await db
      .delete(roomMembers)
      .where(and(eq(roomMembers.userId, String(userId)), eq(roomMembers.roomId, roomId)));
  }

  async getMessages(roomId: number, limit: number = 50): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(desc(messages.timestamp))
      .limit(limit);
    
    return result.reverse(); // 返回时间顺序
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values({
      ...insertMessage,
      timestamp: new Date(),
      isRead: false,
      isDeleted: false
    }).returning();
    return message;
  }

  async createSession(sessionId: string, userId: number): Promise<void> {
    await db.insert(sessions).values({
      sid: sessionId,
      sess: { userId },
      expire: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天过期
    });
  }

  async getSession(sessionId: string): Promise<{ userId: number } | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sid, sessionId));
    
    if (!session) {
      return undefined;
    }

    // 检查会话是否过期
    if (session.expire < new Date()) {
      await this.deleteSession(sessionId);
      return undefined;
    }

    return { userId: (session.sess as any).userId };
  }

  async deleteSession(sessionId: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.sid, sessionId));
  }
}

export { IStorage };