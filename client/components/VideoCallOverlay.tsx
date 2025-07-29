import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";

interface VideoCallOverlayProps {
  participant: {
    id: string;
    nickname?: string;
    username: string;
    avatar?: string;
  };
  onClose: () => void;
}

export default function VideoCallOverlay({ participant, onClose }: VideoCallOverlayProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);

  const displayName = participant.nickname || participant.username;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
      {/* 主视频区域 */}
      <div className="flex-1 relative bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        {isVideoOff ? (
          <div className="text-center text-white">
            <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/20">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback className="text-4xl bg-amber-700 text-white">
                {displayName[0]?.toUpperCase() || '道'}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-gray-300">视频已关闭</p>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <p className="text-white">视频通话中...</p>
          </div>
        )}

        {/* 小窗口（自己的视频） */}
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-white/20 flex items-center justify-center">
          <p className="text-white text-sm">我</p>
        </div>

        {/* 通话信息 */}
        <div className="absolute top-4 left-4 text-white">
          <p className="text-lg font-medium">{displayName}</p>
          <p className="text-sm text-gray-300">{formatDuration(duration)}</p>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="p-6 bg-black/50 backdrop-blur-sm">
        <div className="flex justify-center space-x-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsMuted(!isMuted)}
            className="rounded-full w-16 h-16 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsVideoOff(!isVideoOff)}
            className="rounded-full w-16 h-16 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>
          
          <Button
            variant="destructive"
            size="lg"
            onClick={onClose}
            className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}