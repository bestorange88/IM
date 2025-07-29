import { useEffect, useRef, useState, useCallback } from "react";

interface Message {
  senderId: string;
  roomId: string;
  content: string;
  createdAt: string;
}

export function useChatSocket(roomId: string, token: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = useCallback((content: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "chat", content }));
    }
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", token, roomId }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "chat") {
        setMessages((prev) => [...prev, msg]);
      }
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [roomId, token]);

  return { messages, sendMessage };
}