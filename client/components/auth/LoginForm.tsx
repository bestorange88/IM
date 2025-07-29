import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onBack: () => void;
}

export default function LoginForm({ onSwitchToRegister, onBack }: LoginFormProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.identifier.trim() || !formData.password.trim()) {
      toast({ title: "请填写完整信息", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const user = await login({
        identifier: formData.identifier.trim(),
        password: formData.password,
      });

      toast({
        title: "登录成功",
        description: "欢迎回到泰山宫",
      });

      try {
        navigate('/dao');
      } catch (err) {
        window.location.href = '/dao';
      }

      setTimeout(() => {
        if (window.location.pathname !== '/dao') {
          window.location.href = '/dao';
        }
      }, 1000);

    } catch (error: any) {
      console.error("登录错误:", error);
      toast({
        title: "登录失败",
        description: error?.response?.data?.error || error.message || "用户名或密码错误",
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
        <CardTitle className="text-xl font-bold text-amber-900">登录道观</CardTitle>
        <p className="text-amber-600">欢迎回到泰山宫</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-amber-900">用户名或邮箱</Label>
            <Input
              id="identifier"
              placeholder="请输入用户名或邮箱"
              value={formData.identifier}
              onChange={(e) => handleInputChange("identifier", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-amber-900">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
          </div>
          <Button disabled={loading} type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white">
            {loading ? "登录中..." : "立即登录"}
          </Button>
          <Button variant="ghost" type="button" onClick={onSwitchToRegister} className="w-full text-amber-600">
            还没有账户？点此注册
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}