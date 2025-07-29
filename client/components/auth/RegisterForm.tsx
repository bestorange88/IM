import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onBack: () => void;
}

export default function RegisterForm({ onSwitchToLogin, onBack }: RegisterFormProps) {
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nickname.trim() || !formData.username.trim() || !formData.password.trim()) {
      toast({ title: "请填写完整信息", variant: "destructive" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "两次输入的密码不一致", variant: "destructive" });
      return;
    }

    if (formData.password.length < 6) {
      toast({ title: "密码长度至少6位", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await register({
        username: formData.username.trim(),
        password: formData.password,
        nickname: formData.nickname.trim(),
        confirmPassword: formData.confirmPassword,
        email: formData.email?.trim() || undefined,
      });

      toast({
        title: "注册成功",
        description: "欢迎加入泰山宫道友圈",
      });

      onSwitchToLogin();
    } catch (error: any) {
      console.error("注册错误:", error);
      toast({
        title: "注册失败",
        description: error?.response?.data?.error || error.message || "注册失败，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full border-amber-200 shadow-lg">
      <CardHeader className="text-center relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="absolute left-0 top-2 text-amber-600 hover:bg-amber-50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <CardTitle className="text-xl font-bold text-amber-900">注册入道</CardTitle>
        <p className="text-amber-600">加入泰山宫道友圈</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-amber-900">道号昵称</Label>
            <Input id="nickname" placeholder="请输入道号" value={formData.nickname}
              onChange={(e) => handleInputChange("nickname", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-amber-900">用户名</Label>
            <Input id="username" placeholder="请输入用户名" value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-amber-900">邮箱（可选）</Label>
            <Input id="email" placeholder="可填写邮箱" value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-amber-900">密码</Label>
            <Input id="password" type="password" placeholder="请输入密码" value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-amber-900">确认密码</Label>
            <Input id="confirmPassword" type="password" placeholder="再次输入密码" value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)} />
          </div>
          <Button disabled={loading} type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
            {loading ? "注册中..." : "立即注册"}
          </Button>
          <Button variant="ghost" type="button" onClick={onSwitchToLogin} className="w-full text-amber-600">
            已有账户？点此登录
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}