import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import * as schema from "@shared/schema";
import {
  users,
  type User,
  type InsertUser,
} from "@shared/schema";

let db: any;

// 数据库初始化（伪代码）
async function initDB() {
  if (!db) {
    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
    });
    db = drizzle(connection, { schema, mode: 'default' });

  return db;
}

export class MySQLStorage {
  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await initDB();
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await initDB();
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const db = await initDB();
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    const db = await initDB();
    return await db.select().from(users);
  }

  async getUser(id: string): Promise<User | undefined> {
    const db = await initDB();
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
}