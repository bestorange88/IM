import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Phone, Video } from "lucide-react";
import CallOverlay from "@/components/call/CallOverlay";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useCallSignal } from "@/hooks/useCallSignal";
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
  const [location, navigate] = useLocation();

  // 安全解析 contact 参数
  const searchParams = new URLSearchParams(location?.split("?")[1] || "");
  const contactId = searchParams.get("contact");

  const [contact, setContact] = useState<User | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "incoming" | "in-call">("idle");
  const [isCaller, setIsCaller] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);

  const { sendSignal } = useCallSignal(user?.userId || "", async (msg) => {
    if (!msg?.type) return;

    if (msg.type === "call") {
      setCallStatus("incoming");
      setIsCaller(false);
    } else if (msg.type === "accept") {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      sendSignal("offer", msg.from, offer);
    } else if (msg.type === "offer") {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.data));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      sendSignal("answer", msg.from, answer);
    } else if (msg.type === "answer") {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(msg.data));
      setCallStatus("in-call");
    } else if (msg.type === "candidate") {
      await peerConnection.addIceCandidate(new RTCIceCandidate(msg.data));
    }
  });

  const { localStream, remoteStream, peerConnection } = useWebRTC(isCaller, isVideoCall);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage } = useChatSocket(roomId || "", token || "");

  useEffect(() => {
    if (!peerConnection || !contact?.userId) return;
    peerConnection.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal("candidate", contact.userId, e.candidate);
      }
    };
  }, [peerConnection, contact?.userId, sendSignal]);

  useEffect(() => {
    if (!contactId || !token) return;

    const fetchContactAndRoom = async () => {
      try {
        const contactData = await apiRequest(`/api/user/${contactId}`);
        setContact(contactData);

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
  };

  const handleCall = (video = false) => {
    if (!contact) return;
    setIsCaller(true);
    setIsVideoCall(video);
    setCallStatus("calling");
    sendSignal("call", contact.userId);
  };

  const handleAccept = () => setCallStatus("in-call");
  const handleReject = () => setCallStatus("idle");
  const handleHangup = () => setCallStatus("idle");

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
        <Button onClick={() => handleCall(true)} className="bg-blue-500 text-white">
          <Video className="w-4 h-4" />
        </Button>
        <Button onClick={() => handleCall(false)} className="bg-green-500 text-white">
          <Phone className="w-4 h-4" />
        </Button>
        <Button onClick={handleSend} className="bg-amber-500 text-white">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {callStatus !== "idle" && contact && (
        <CallOverlay
          callerName={contact.nickname || contact.username}
          status={callStatus}
          onAccept={handleAccept}
          onReject={handleReject}
          onHangup={handleHangup}
        />
      )}

      {isVideoCall && callStatus === "in-call" && (
        <div className="absolute inset-0 z-40 bg-black flex items-center justify-center">
          <video
            autoPlay
            playsInline
            muted
            className="w-40 h-40 absolute bottom-4 right-4 rounded border"
            ref={(el) => {
              if (el && localStream) el.srcObject = localStream;
            }}
          />
          <video
            autoPlay
            playsInline
            className="w-full max-w-md rounded"
            ref={(el) => {
              if (el && remoteStream) el.srcObject = remoteStream;
            }}
          />
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
