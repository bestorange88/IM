import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  json,
  index,
  int,
  boolean,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ─── Tables ────────────────────────────────────────────────

// Session storage
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// Users
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  username: varchar("username", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  nickname: varchar("nickname", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  avatar: varchar("avatar", { length: 255 }),
  status: varchar("status", { length: 50 }).default("offline"),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat Rooms  
export const chatRooms = mysqlTable("chat_rooms", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull().default("group"),
  avatar: varchar("avatar", { length: 255 }),
  createdBy: varchar("created_by", { length: 255 }).references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Room Members
export const roomMembers = mysqlTable("room_members", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  roomId: int("room_id").references(() => chatRooms.id).notNull(),
  role: varchar("role", { length: 50 }).default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Messages (群聊消息)
export const messages = mysqlTable("messages", {
  id: int("id").primaryKey().autoincrement(),
  content: text("content").notNull(),
  senderId: varchar("sender_id", { length: 255 }).references(() => users.id).notNull(),
  roomId: int("room_id").references(() => chatRooms.id).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("text"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isRead: boolean("is_read").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
});

// Private Messages (私聊消息)
export const privateMessages = mysqlTable("private_messages", {
  id: int("id").primaryKey().autoincrement(),
  content: text("content").notNull(),
  senderId: varchar("sender_id", { length: 255 }).references(() => users.id).notNull(),
  receiverId: varchar("receiver_id", { length: 255 }).references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("text"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isRead: boolean("is_read").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
});

// Friendships (好友关系)
export const friendships = mysqlTable("friendships", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  friendId: varchar("friend_id", { length: 255 }).references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("accepted"),
  requestedBy: varchar("requested_by", { length: 255 }).references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// File Attachments (文件附件)
export const fileAttachments = mysqlTable("file_attachments", {
  id: int("id").primaryKey().autoincrement(),
  messageId: int("message_id").references(() => messages.id),
  privateMessageId: int("private_message_id").references(() => privateMessages.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: int("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  uploadedBy: varchar("uploaded_by", { length: 255 }).references(() => users.id).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

// Message Read Status (消息已读状态)
export const messageReadStatus = mysqlTable("message_read_status", {
  id: int("id").primaryKey().autoincrement(),
  messageId: int("message_id").references(() => messages.id),
  privateMessageId: int("private_message_id").references(() => privateMessages.id),
  userId: varchar("user_id", { length: 255 }).references(() => users.id).notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  sentMessages: many(messages),
  sentPrivateMessages: many(privateMessages, { relationName: "sent_private_messages" }),
  receivedPrivateMessages: many(privateMessages, { relationName: "received_private_messages" }),
  roomMemberships: many(roomMembers),
  friendships: many(friendships, { relationName: "user_friendships" }),
  friendOf: many(friendships, { relationName: "friend_of" }),
  uploadedFiles: many(fileAttachments),
  readMessages: many(messageReadStatus),
}));

export const chatRoomsRelations = relations(chatRooms, ({ many, one }) => ({
  members: many(roomMembers),
  messages: many(messages),
  creator: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id],
  }),
}));

export const roomMembersRelations = relations(roomMembers, ({ one }) => ({
  user: one(users, {
    fields: [roomMembers.userId],
    references: [users.id],
  }),
  room: one(chatRooms, {
    fields: [roomMembers.roomId],
    references: [chatRooms.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  room: one(chatRooms, {
    fields: [messages.roomId],
    references: [chatRooms.id],
  }),
  readStatus: many(messageReadStatus),
}));

export const privateMessagesRelations = relations(privateMessages, ({ one }) => ({
  sender: one(users, {
    fields: [privateMessages.senderId],
    references: [users.id],
    relationName: "sent_private_messages",
  }),
  receiver: one(users, {
    fields: [privateMessages.receiverId],
    references: [users.id],
    relationName: "received_private_messages",
  }),

}));

export const messageReadStatusRelations = relations(messageReadStatus, ({ one }) => ({
  message: one(messages, {
    fields: [messageReadStatus.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReadStatus.userId],
    references: [users.id],
  }),
}));

export const fileAttachmentsRelations = relations(fileAttachments, ({ one }) => ({
  uploader: one(users, {
    fields: [fileAttachments.uploadedBy],
    references: [users.id],
  }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
    relationName: "user_friendships",
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
    relationName: "friend_of",
  }),
}));

// ─── Types ────────────────────────────────────────────────

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoom = typeof chatRooms.$inferInsert;

export type RoomMember = typeof roomMembers.$inferSelect;
export type InsertRoomMember = typeof roomMembers.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export type PrivateMessage = typeof privateMessages.$inferSelect;
export type InsertPrivateMessage = typeof privateMessages.$inferInsert;

export type MessageReadStatus = typeof messageReadStatus.$inferSelect;
export type InsertMessageReadStatus = typeof messageReadStatus.$inferInsert;

export type FileAttachment = typeof fileAttachments.$inferSelect;
export type InsertFileAttachment = typeof fileAttachments.$inferInsert;

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = typeof friendships.$inferInsert;

// Extended types for API responses
export type ChatRoomWithMembers = ChatRoom & {
  members: (RoomMember & {
    user: {
      id: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    };
  })[];
};

export type MessageWithUser = Message & {
  sender: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
};

// ─── Zod Schemas ────────────────────────────────────────────────

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSeen: true,
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  timestamp: true,
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空").optional(),
  identifier: z.string().min(1, "用户名或邮箱不能为空").optional(),
  password: z.string().min(1, "密码不能为空"),
}).refine(data => data.username || data.identifier, {
  message: "必须提供用户名或邮箱",
});

export const registerSchema = z.object({
  username: z.string().min(3, "用户名至少3个字符").max(30, "用户名最多30个字符"),
  nickname: z.string().min(1, "请输入昵称"),
  password: z.string().min(6, "密码至少6个字符"),
  confirmPassword: z.string().min(6, "确认密码至少6个字符").optional(),
  email: z.string().email("邮箱格式不正确").optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

// ─── Types from Zod ────────────────────────────────────────────────

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
