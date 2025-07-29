import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';

interface User {
  id: string;
  username: string;
  nickname?: string;
  email?: string;
  avatar?: string;
  status?: string;
  isOnline?: boolean;
  createdAt?: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<User>;
  register: (data: { username: string; password: string; nickname: string }) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  // 检查用户登录状态
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const userData = await apiRequest('/api/auth/user');
        setUser(userData);
      } catch (error) {
        console.error('检查认证状态失败:', error);
        localStorage.removeItem('auth-token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: { identifier: string; password: string }): Promise<User> => {
    try {
      console.log("开始登录请求:", credentials.identifier);
      
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: credentials,
      });

      console.log("登录响应完整数据:", JSON.stringify(response, null, 2));

      // 检查响应格式 - 服务器返回的是平铺格式，不是嵌套在user字段中
      if (!response || !response.id || !response.username) {
        throw new Error('登录响应格式错误');
      }

      if (response.token) {
        localStorage.setItem('auth-token', response.token);
        console.log("Token已保存:", response.token.substring(0, 20) + "...");
      }

      // 构建用户对象，确保所有必需字段都存在
      const userObj: User = {
        id: response.id,
        username: response.username,
        nickname: response.nickname || response.username,
        email: response.email || '',
        avatar: response.avatar || '/default-avatar.png',
        status: response.status || 'online',
        isOnline: response.isOnline || true,
        createdAt: response.createdAt || new Date().toISOString(),
      };

      setUser(userObj);
      console.log("用户状态已更新:", userObj);
      
      // 延迟跳转确保状态更新完成
      setTimeout(() => {
        console.log("执行跳转到dao页面");
        setLocation('/dao');
      }, 100);
      
      return userObj;
    } catch (error) {
      console.error('登录失败详细信息:', error);
      throw error;
    }
  };

  const register = async (data: { username: string; password: string; nickname: string }): Promise<User> => {
    try {
      console.log("开始注册请求:", data.username, data.nickname);
      
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: data,
      });

      console.log("注册响应完整数据:", JSON.stringify(response, null, 2));

      if (response.token) {
        localStorage.setItem('auth-token', response.token);
        console.log("注册Token已保存:", response.token.substring(0, 20) + "...");
      }

      // 构建用户对象，确保所有必需字段都存在
      const userObj: User = {
        id: response.id,
        username: response.username,
        nickname: response.nickname || response.username,
        email: response.email || '',
        avatar: response.avatar || '/default-avatar.png',
        status: response.status || 'online',
        isOnline: response.isOnline || true,
        createdAt: response.createdAt || new Date().toISOString(),
      };

      setUser(userObj);
      console.log("注册后用户状态已更新:", userObj);
      
      // 注册成功后自动跳转到dao页面
      setTimeout(() => {
        console.log("执行注册后跳转到dao页面");
        setLocation('/dao');
      }, 100);
      
      return userObj;
    } catch (error) {
      console.error('注册失败详细信息:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      localStorage.removeItem('auth-token');
      setUser(null);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}