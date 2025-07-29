import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from "lucide-react";

interface VideoCallDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    id: string;
    nickname?: string;
    username: string;
    avatar?: string;
  };
  type: 'voice' | 'video';
}

export default function VideoCallDialog({ isOpen, onClose, contact, type }: VideoCallDialogProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(type === 'video');
  const [callDuration, setCallDuration] = useState(0);

  const handleConnect = () => {
    setIsConnected(true);
    // 模拟通话计时
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    // 自动断开演示
    setTimeout(() => {
      clearInterval(timer);
      handleEndCall();
    }, 30000); // 30秒后自动结束
  };

  const handleEndCall = () => {
    setIsConnected(false);
    setCallDuration(0);
    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {type === 'video' ? '视频通话' : '语音通话'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isConnected ? `通话中 ${formatDuration(callDuration)}` : '正在连接...'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          {/* 联系人头像 */}
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback className="bg-amber-100 text-amber-700 text-2xl">
                {(contact.nickname || contact.username)[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isConnected && (
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* 联系人信息 */}
          <div className="text-center">
            <h3 className="font-semibold text-lg text-amber-900">
              {contact.nickname || contact.username}
            </h3>
            <p className="text-amber-600 text-sm">
              {isConnected ? '已连接' : '连接中...'}
            </p>
          </div>

          {/* 模拟视频区域 */}
          {type === 'video' && isVideoEnabled && (
            <div className="w-full h-32 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
              <Video className="w-8 h-8 text-amber-600" />
              <span className="ml-2 text-amber-700">演示模式</span>
            </div>
          )}

          {/* 通话控制按钮 */}
          <div className="flex space-x-4">
            {/* 静音按钮 */}
            <Button
              variant={isMuted ? "destructive" : "outline"}
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full"
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* 视频开关（仅视频通话） */}
            {type === 'video' && (
              <Button
                variant={isVideoEnabled ? "outline" : "destructive"}
                size="icon"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className="rounded-full"
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            )}

            {/* 挂断按钮 */}
            <Button
              variant="destructive"
              size="icon"
              onClick={handleEndCall}
              className="rounded-full"
            >
              <PhoneOff className="w-4 h-4" />
            </Button>
          </div>

          {/* 连接按钮（仅在未连接时显示） */}
          {!isConnected && (
            <Button onClick={handleConnect} className="w-full bg-green-600 hover:bg-green-700">
              <Phone className="w-4 h-4 mr-2" />
              接通通话（演示）
            </Button>
          )}

          {/* 演示提示 */}
          <div className="text-center text-xs text-amber-600 bg-amber-50 p-2 rounded">
            🎭 这是演示模式，真实通话功能正在开发中
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}