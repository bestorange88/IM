import {
  mysqlTable,
  varchar,
  text,
  serial,
  timestamp,
  boolean,
  int,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// 用户表
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: varchar("username", { length: 50 }).unique(),
  password: varchar("password", { length: 255 }),
  nickname: varchar("nickname", { length: 50 }),
  avatar: text("avatar"),
  email: varchar("email", { length: 100 }),
  status: varchar("status", { length: 20 }).default("offline"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 聊天室表
export const chatRooms = mysqlTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["group", "private", "system"]).default("group"),
  avatar: text("avatar"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// 房间成员表
export const roomMembers = mysqlTable("room_members", {
  id: serial("id").primaryKey(),
  roomId: int("room_id").notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// 消息表
export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  type: varchar("type", { length: 20 }).default("text"),
  senderId: varchar("sender_id", { length: 255 }).notNull(),
  roomId: int("room_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// 类型定义
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = typeof chatRooms.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type RoomMember = typeof roomMembers.$inferSelect;
export type InsertRoomMember = typeof roomMembers.$inferInsert;

// 扩展类型
export interface MessageWithUser extends Message {
  sender: {
    id: string;
    username: string | null;
    nickname: string | null;
    avatar: string | null;
  };
}

export interface ChatRoomWithMembers extends ChatRoom {
  members: Array<RoomMember & {
    user: {
      id: string;
      username: string | null;
      nickname: string | null;
      avatar: string | null;
    };
  }>;
}

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  id: true,
});

export const selectUserSchema = createSelectSchema(users);

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

export const insertRoomMemberSchema = createInsertSchema(roomMembers).omit({
  id: true,
  joinedAt: true,
});