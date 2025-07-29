import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, Shield, Bell, HelpCircle, LogOut, Star, Calendar, Award, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/apiRequest";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!user?.groupId) return;
      try {
        const res = await apiRequest(`/api/group/${user.groupId}`);
        setGroup(res);
      } catch (err) {
        console.error("加载分组失败", err);
      }
    };
    fetchGroup();
  }, [user?.groupId]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "退出成功",
        description: "已安全退出泰山宫",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "退出失败",
        description: "退出时发生错误",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-200">
        <div className="text-center">
          <User className="w-12 h-12 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-700">请先登录</p>
        </div>
      </div>
    );
  }

  const displayName = user.nickname || user.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-100">
      <Header title="我的道宫" />

      <div className="pt-16 pb-20 px-4 max-w-md mx-auto space-y-6">
        {/* 用户信息卡片 */}
        <Card className="bg-white/90 backdrop-blur-md border-amber-200">
          <CardHeader>
            <CardTitle>道友 {displayName}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-2">
              <img src={user.avatar || ""} alt="" />
            </Avatar>
            <div className="text-sm text-gray-500">UID: {user.userId}</div>
            <div className="text-sm text-amber-700 mt-1">{user.email}</div>
            <Button onClick={handleLogout} className="mt-4 w-full bg-amber-600 text-white">
              <LogOut className="w-4 h-4 mr-2" /> 安全退出
            </Button>
          </CardContent>
        </Card>

        {/* 分组权限信息卡片 */}
        {group && (
          <Card className="bg-white/90 border-amber-300">
            <CardHeader>
              <CardTitle>所属用户组：{group.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  {group.canAddFriend ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-400 w-4 h-4" />}
                  <span>允许添加好友</span>
                </li>
                <li className="flex items-center gap-2">
                  {group.canViewProfiles ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-400 w-4 h-4" />}
                  <span>允许查看他人资料</span>
                </li>
                <li className="flex items-center gap-2">
                  {group.canJoinGroup ? <CheckCircle className="text-green-500 w-4 h-4" /> : <XCircle className="text-red-400 w-4 h-4" />}
                  <span>允许加入聊天室/群聊</span>
                </li>
              </ul>
              <div className="text-xs text-gray-400 mt-2">{group.description}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}