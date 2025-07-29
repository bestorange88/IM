import { mysqlTable, varchar, text, int, boolean, timestamp, serial, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// 重新导入基础表
export { users, chatRooms, roomMembers, messages, privateMessages, fileAttachments, messageReadStatus, friendships, sessions } from "./schema";

// 群组信息扩展表
export const groupInfo = mysqlTable("group_info", {
  id: serial("id").primaryKey(),
  roomId: int("roomId").notNull(),
  groupCode: varchar("groupCode", { length: 20 }).unique(),
  maxMembers: int("maxMembers").default(500),
  joinPolicy: varchar("joinPolicy", { length: 20 }).default("open"), // 'open', 'approval', 'invite_only'
  allowInvite: boolean("allowInvite").default(true),
  allowMemberChat: boolean("allowMemberChat").default(true),
  announcement: text("announcement"),
  rules: text("rules"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 成员扩展信息表
export const memberInfo = mysqlTable("member_info", {
  id: serial("id").primaryKey(),
  roomId: int("roomId").notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  groupNickname: varchar("groupNickname", { length: 100 }),
  muteUntil: timestamp("muteUntil"),
  joinedBy: varchar("joinedBy", { length: 255 }),
  inviteCount: int("inviteCount").default(0),
  lastReadMessageId: int("lastReadMessageId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 用户在线状态表
export const userPresence = mysqlTable("user_presence", {
  id: serial("id").primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("offline"), // 'online', 'away', 'busy', 'offline', 'invisible'
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  deviceType: varchar("deviceType", { length: 20 }).default("web"), // 'web', 'mobile', 'desktop'
  deviceId: varchar("deviceId", { length: 100 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  location: varchar("location", { length: 100 }),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 用户设置表
export const userSettings = mysqlTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  settingKey: varchar("settingKey", { length: 100 }).notNull(),
  settingValue: text("settingValue"),
  settingType: varchar("settingType", { length: 20 }).default("string"), // 'string', 'number', 'boolean', 'json'
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// 消息回复表
export const messageReplies = mysqlTable("message_replies", {
  id: serial("id").primaryKey(),
  messageId: int("messageId").notNull(),
  replyToMessageId: int("replyToMessageId").notNull(),
  replyToUserId: varchar("replyToUserId", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 消息表情回应表
export const messageReactions = mysqlTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: int("messageId").notNull(),
  userId: varchar("userId", { length: 255 }).notNull(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// 推送通知表
export const pushNotifications = mysqlTable("push_notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'message', 'friend_request', 'group_invite', 'system'
  relatedId: int("relatedId"),
  isRead: boolean("isRead").default(false),
  isPushed: boolean("isPushed").default(false),
  pushTime: timestamp("pushTime"),
  deviceTokens: json("deviceTokens"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ============================================================================
// 关系定义
// ============================================================================

export const groupInfoRelations = relations(groupInfo, ({ one }) => ({
  room: one(chatRooms, {
    fields: [groupInfo.roomId],
    references: [chatRooms.id],
  }),
}));

export const memberInfoRelations = relations(memberInfo, ({ one }) => ({
  room: one(chatRooms, {
    fields: [memberInfo.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [memberInfo.userId],
    references: [users.id],
  }),
}));

export const userPresenceRelations = relations(userPresence, ({ one }) => ({
  user: one(users, {
    fields: [userPresence.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const messageRepliesRelations = relations(messageReplies, ({ one }) => ({
  message: one(messages, {
    fields: [messageReplies.messageId],
    references: [messages.id],
  }),
  replyToMessage: one(messages, {
    fields: [messageReplies.replyToMessageId],
    references: [messages.id],
  }),
  replyToUser: one(users, {
    fields: [messageReplies.replyToUserId],
    references: [users.id],
  }),
}));

export const messageReactionsRelations = relations(messageReactions, ({ one }) => ({
  message: one(messages, {
    fields: [messageReactions.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReactions.userId],
    references: [users.id],
  }),
}));

export const pushNotificationsRelations = relations(pushNotifications, ({ one }) => ({
  user: one(users, {
    fields: [pushNotifications.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// 类型定义
// ============================================================================

export type GroupInfo = typeof groupInfo.$inferSelect;
export type InsertGroupInfo = typeof groupInfo.$inferInsert;

export type MemberInfo = typeof memberInfo.$inferSelect;
export type InsertMemberInfo = typeof memberInfo.$inferInsert;

export type UserPresence = typeof userPresence.$inferSelect;
export type InsertUserPresence = typeof userPresence.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

export type MessageReply = typeof messageReplies.$inferSelect;
export type InsertMessageReply = typeof messageReplies.$inferInsert;

export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = typeof messageReactions.$inferInsert;

export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = typeof pushNotifications.$inferInsert;

// 扩展的聊天室类型（包含群组信息）
export interface ChatRoomWithGroupInfo extends ChatRoom {
  groupInfo?: GroupInfo;
  memberCount: number;
}

// 扩展的成员类型（包含群昵称等信息）
export interface MemberWithInfo extends User {
  role: string;
  joinedAt: Date;
  groupNickname?: string;
  muteUntil?: Date;
  joinedBy?: string;
}

// 增强的消息类型（包含回复和表情）
export interface MessageWithExtras extends MessageWithUser {
  replies?: MessageReply[];
  reactions?: MessageReaction[];
  replyCount: number;
  reactionCount: number;
}