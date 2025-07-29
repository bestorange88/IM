import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

const MYSQL_URL = process.env.DATABASE_URL || 'mysql://taishanguan:aXeMHTTGpWRxL8iK@localhost:3306/taishanguan';

console.log("🔄 初始化MySQL数据库连接");
console.log("MySQL URL:", MYSQL_URL.replace(/:[^:@]*@/, ':***@'));

const connection = mysql.createPool({
  uri: MYSQL_URL,
  connectionLimit: 10,
  reconnect: true
});

export const db = drizzle(connection, { schema, mode: 'default' });
export { connection as pool };