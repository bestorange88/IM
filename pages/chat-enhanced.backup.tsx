import { useEffect, useState, useRef } from "react";
import { useSearchParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Phone } from "lucide-react";
import CallOverlay from "@/components/call/CallOverlay";
import { apiRequest } from "@/lib/apiRequest";
import { useChatSocket } from "@/hooks/useChatSocket";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/BottomNavigation";

interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
}

export default function ChatEnhancedPage() {
  const { token, user } = useAuth();
  const [params] = useSearchParams();
  const [, navigate] = useLocation();
  const contactId = params.get("contact");

  const [contact, setContact] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "in-call">("idle");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage } = useChatSocket(roomId || "", token || "");

  useEffect(() => {
    if (!contactId || !token) return;

    const fetchContactAndRoom = async () => {
      try {
        const contactData = await apiRequest(`/api/user/${contactId}`);
        setContact(contactData);

        // 查找或创建私聊房间
        const roomRes = await apiRequest(`/api/chat/private/${contactId}`, {
          method: "POST",
        });
        setRoomId(roomRes.id);
      } catch (err) {
        console.error("加载联系人或房间失败:", err);
      }
    };

    fetchContactAndRoom();
  }, [contactId, token]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMessage(messageText.trim());
    setMessageText("");
  const handleCall = () => {
    if (!contact) return;
    setCallStatus("calling");
  };

const handleAccept = () => setCallStatus("in-call");
const handleReject = () => setCallStatus("idle");
const handleHangup = () => setCallStatus("idle");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-yellow-50 to-orange-100">
      <Header
        title={
          <div className="flex items-center gap-2">
            <ArrowLeft
              className="cursor-pointer text-amber-700"
              onClick={() => navigate("/contacts")}
            />
            <img
              src={contact?.avatar || ""}
              className="w-8 h-8 rounded-full"
              alt="avatar"
            />
            <span className="text-lg font-semibold text-amber-900">
              {contact?.nickname || contact?.username || "聊天中"}
            </span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 py-20 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xs p-2 rounded shadow ${
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
          placeholder="输入消息..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleCall} className="bg-green-500 text-white mr-2">
  <Phone className="w-4 h-4" />
</Button>
        <Button onClick={handleSend} className="bg-amber-500 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {callStatus !== 'idle' && contact && (
  <CallOverlay
    callerName={contact.nickname || contact.username}
    status={callStatus === "calling" ? "calling" : callStatus === "in-call" ? "in-call" : "incoming"}
    onAccept={handleAccept}
    onReject={handleReject}
    onHangup={handleHangup}
  />
)}

<BottomNavigation />
    </div>
  );
}