import { db } from "./db"; // 假设你的 db 初始化在 db.ts 中
import { userGroups } from "./schema";

async function seedDefaultGroups() {
  const groups = [
    {
      id: "group-real",
      name: "真实会员",
      canAddFriend: false,
      canViewProfiles: false,
      canJoinGroup: true,
      description: "限制查看资料与添加好友的普通用户",
    },
    {
      id: "group-staff",
      name: "员工组",
      canAddFriend: true,
      canViewProfiles: true,
      canJoinGroup: true,
      description: "具有完整功能的官方或运营人员",
    },
  ];

  for (const g of groups) {
    await db.insert(userGroups).values(g).onDuplicateKeyUpdate({
      name: g.name,
      canAddFriend: g.canAddFriend,
      canViewProfiles: g.canViewProfiles,
      canJoinGroup: g.canJoinGroup,
      description: g.description,
    });
  }

  console.log("✅ 用户组初始化完成");
}

seedDefaultGroups().catch(console.error);