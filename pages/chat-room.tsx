import { useEffect, useState, useRef } from "react";
import { useSearchParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/apiRequest";
import { useChatSocket } from "@/hooks/useChatSocket";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { LogOut, Send, Users, MessageCircle } from "lucide-react";

export default function ChatRoomPage() {
  const { token, user, logout } = useAuth();
  const [params] = useSearchParams();
  const [, navigate] = useLocation();
  const roomId = params.get("id") || "public-hall";
  const [roomName, setRoomName] = useState("泰山公聊堂");
  const [group, setGroup] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage } = useChatSocket(roomId, token || "");

  useEffect(() => {
    const fetchGroup = async () => {
      if (!user?.groupId) return;
      try {
        const res = await apiRequest(`/api/group/${user.groupId}`);
        setGroup(res);
        if (!res.canJoinGroup) {
          alert("当前用户组无权限进入聊天室");
          navigate("/profile");
        }
      } catch (err) {
        console.error("获取权限失败", err);
      }
    };
    fetchGroup();
  }, [user?.groupId]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessage(messageText.trim());
    setMessageText("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 to-yellow-100">
      <Header
        title={
          <div className="flex items-center gap-2 text-amber-800">
            <MessageCircle className="w-5 h-5" />
            <span>{roomName}</span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-20 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-lg p-2 rounded shadow ${
              msg.senderId === user?.userId
                ? "ml-auto bg-amber-200"
                : "mr-auto bg-white"
            }`}
          >
            <div className="text-sm">{msg.content}</div>
            <div className="text-xs text-right text-gray-400">
              {new Date(msg.createdAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2 bg-white">
        <Input
          placeholder="输入你的发言..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSend} className="bg-amber-500 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}