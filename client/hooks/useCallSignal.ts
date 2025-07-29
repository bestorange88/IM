import { useEffect, useRef } from "react";

type SignalType = "offer" | "answer" | "candidate" | "call" | "accept" | "reject";

interface SignalMessage {
  type: SignalType;
  from: string;
  to: string;
  data?: any;
}

type Handler = (msg: SignalMessage) => void;

export function useCallSignal(userId: string, onSignal: Handler) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket("wss://im.1388.ink/ws/signaling");
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "register", userId }));
    };

    ws.onmessage = (event) => {
      const msg: SignalMessage = JSON.parse(event.data);
      if (msg.to === userId) {
        onSignal(msg);
      }
    };

    return () => {
      ws.close();
    };
  }, [userId]);

  const sendSignal = (type: SignalType, to: string, data?: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const msg: SignalMessage = { type, from: userId, to, data };
    wsRef.current.send(JSON.stringify(msg));
  };

  return { sendSignal };
}