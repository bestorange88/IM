import React, { useState } from "react";
import { useChatSocket } from "../hooks/useChatSocket";

interface ChatRoomProps {
  roomId: string;
  token: string;
  userId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, token, userId }) => {
  const { messages, sendMessage } = useChatSocket(roomId, token);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto border rounded shadow bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.senderId === userId ? "bg-blue-100 text-right" : "bg-gray-100 text-left"
            }`}
          >
            <div className="text-xs text-gray-500">{msg.senderId}</div>
            <div>{msg.content}</div>
            <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
          发送
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;