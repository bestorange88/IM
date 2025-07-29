import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Phone, User, Triangle } from "lucide-react";

interface NavigationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  const tabs = [
    { id: "chats", label: "聊天", icon: MessageCircle },
    { id: "contacts", label: "联系人", icon: Users },
    { id: "calls", label: "通话", icon: Phone },
    { id: "dao", label: "道", icon: Triangle },
    { id: "profile", label: "我的", icon: User },
  ];

  return (
    <nav className="bg-white border-t fixed bottom-0 left-0 right-0 w-full z-50 shadow-lg overflow-x-hidden">
      <div className="flex justify-around items-center py-2 px-2 min-w-0">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`flex flex-col items-center space-y-1 flex-1 max-w-none min-w-0 py-3 ${
              activeTab === tab.id ? "text-amber-600 bg-amber-50" : "text-gray-500"
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <tab.icon className={`w-5 h-5 flex-shrink-0 ${
              tab.id === 'dao' && activeTab === tab.id ? 'text-amber-600' : ''
            }`} />
            <span className="text-xs truncate">{tab.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}