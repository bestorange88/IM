import { useLocation } from "wouter";
import { MessageCircle, Users, Home, Phone, User, Triangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    {
      icon: Triangle,
      label: "道",
      path: "/dao",
      isActive: location === "/dao" || location === "/",
    },
    {
      icon: MessageCircle,
      label: "聊天",
      path: "/chat-enhanced",
      isActive: location.startsWith("/chat"),
    },
    {
      icon: Users,
      label: "道友",
      path: "/contacts",
      isActive: location === "/contacts",
    },
    {
      icon: Phone,
      label: "通话",
      path: "/calls",
      isActive: location === "/calls",
    },
    {
      icon: User,
      label: "我的",
      path: "/profile",
      isActive: location === "/profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-amber-200">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center space-y-1 p-2 h-auto ${
                  item.isActive
                    ? "text-amber-600 bg-amber-50"
                    : "text-amber-400 hover:text-amber-600 hover:bg-amber-50"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}