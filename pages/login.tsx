// 兼容性文件 - 重定向到landing页面
import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function LoginPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // 自动重定向到landing页面
    setLocation('/');
  }, [setLocation]);

  return null;
}