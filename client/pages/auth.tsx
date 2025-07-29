import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { loginSchema, registerSchema, type LoginData, type RegisterData } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// 统一跳转路径
const SUCCESS_REDIRECT_PATH = "/dao";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      nickname: "",
      password: "",
      confirmPassword: "",
      email: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      if (!response.ok) throw new Error((await response.json()).error || "登录失败");
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      toast({
        title: "登录成功",
        description: `欢迎回来，${data.nickname || data.username}道友！`,
      });
      try {
        setLocation(SUCCESS_REDIRECT_PATH);
      } catch (error) {
        window.location.href = SUCCESS_REDIRECT_PATH;
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: error?.message || "请检查用户名和密码",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      if (!response.ok) throw new Error((await response.json()).error || "注册失败");
      return response.json();
    },
    onSuccess: (data) => {
      // ✅ 自动登录逻辑（你可以改为跳转到登录页）
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      toast({
        title: "注册成功",
        description: `欢迎加入泰山宫，${data.nickname || data.username}道友！`,
      });
      try {
        setLocation(SUCCESS_REDIRECT_PATH);
      } catch (error) {
        window.location.href = SUCCESS_REDIRECT_PATH;
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "注册失败",
        description: error?.message || "注册信息有误，请检查后重试",
      });
    },
  });

  return null; // 你可以继续渲染表单页面内容
}