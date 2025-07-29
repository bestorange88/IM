import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Search, Settings, Bell, HelpCircle, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export default function Header({ title, showSearch = false, onSearch }: HeaderProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [, navigate] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/");
  };

  const menuItems = [
    { icon: Bell, label: "消息通知", onClick: () => console.log("通知") },
    { icon: Shield, label: "隐私设置", onClick: () => console.log("隐私") },
    { icon: HelpCircle, label: "帮助与支持", onClick: () => console.log("帮助") },
    { icon: Settings, label: "设置", onClick: () => navigate("/settings") },
    { icon: LogOut, label: "退出登录", onClick: handleLogout },
  ];

  return (
    <>
      <header className="bg-gradient-to-r from-red-800 to-amber-700 text-white border-b fixed top-0 left-0 right-0 w-full z-50 shadow-lg overflow-x-hidden">
        <div className="flex items-center justify-between px-4 py-3 min-w-0">
          <h1 className="text-xl font-semibold truncate flex-1 min-w-0">{title}</h1>
          
          <div className="flex items-center space-x-3 flex-shrink-0">
            {showSearch && (
              <Button variant="ghost" size="icon" className="text-white hover:bg-red-700/50">
                <Search className="w-5 h-5" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-red-700/50"
              onClick={() => setShowMenu(!showMenu)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 下拉菜单 */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="fixed top-16 right-4 bg-white rounded-lg shadow-lg border w-64 max-w-[calc(100vw-2rem)] z-50">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-amber-500 text-white">
                    {user?.nickname?.[0] || user?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">
                    {user?.nickname || user?.username || "用户"}
                  </p>
                  <p className="text-sm text-gray-600">在线</p>
                </div>
              </div>
            </div>
            
            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 text-gray-700"
                >
                  <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}