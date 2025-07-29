import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { userGroups, users } from "../schema";

// 权限键列表示例：canAddFriend、canViewProfiles
export function requirePermission(permissionKey: keyof typeof userGroups.$inferSelect) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: "未登录" });

      const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, userId),
        with: { group: true },
      });

      if (!user || !user.groupId) return res.status(403).json({ error: "无用户分组信息" });

      const group = await db.query.userGroups.findFirst({
        where: (g, { eq }) => eq(g.id, user.groupId),
      });

      if (!group) return res.status(403).json({ error: "无权限组记录" });

      const hasPermission = group[permissionKey];
      if (!hasPermission) {
        return res.status(403).json({ error: `没有权限执行此操作 (${permissionKey})` });
      }

      next();
    } catch (err) {
      console.error("权限检查失败", err);
      return res.status(500).json({ error: "权限检查出错" });
    }
  };
}