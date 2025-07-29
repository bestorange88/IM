

import { mysqlTable, varchar, text, timestamp } from "drizzle-orm/mysql-core";

export const messages = mysqlTable("messages", {
  id: varchar("id", { length: 36 }).primaryKey().defaultRandom(), // UUID
  roomId: varchar("room_id", { length: 36 }).notNull(),
  senderId: varchar("sender_id", { length: 36 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

import { mysqlTable, varchar, boolean, text } from "drizzle-orm/mysql-core";

export const userGroups = mysqlTable("user_groups", {
  id: varchar("id", { length: 36 }).primaryKey().defaultRandom(),
  name: varchar("name", { length: 50 }).notNull(), // 如 “真实会员”
  canAddFriend: boolean("can_add_friend").default(false),
  canViewProfiles: boolean("can_view_profiles").default(false),
  canJoinGroup: boolean("can_join_group").default(true),
  description: text("description"),
});

// 在 users 表中加入 group_id 字段
import { foreignKey } from "drizzle-orm/mysql-core";
import { userGroups } from "./user_groups";

users.groupId = varchar("group_id", { length: 36 })
  .notNull()
  .references(() => userGroups.id);