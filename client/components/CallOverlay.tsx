import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PhoneOff, Mic, MicOff } from "lucide-react";

interface CallOverlayProps {
  participant: {
    id: string;
    nickname?: string;
    username: string;
    avatar?: string;
  };
  onClose: () => void;
}

export default function CallOverlay({ participant, onClose }: CallOverlayProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  const displayName = participant.nickname || participant.username;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 to-orange-900 flex flex-col items-center justify-center z-50">
      <div className="text-center text-white mb-8">
        <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/20">
          <AvatarImage src={participant.avatar} />
          <AvatarFallback className="text-4xl bg-amber-700 text-white">
            {displayName[0]?.toUpperCase() || '道'}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold mb-2">{displayName}</h2>
        <p className="text-amber-200">语音通话</p>
        <p className="text-lg mt-4">{formatDuration(duration)}</p>
      </div>

      <div className="flex space-x-6">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setIsMuted(!isMuted)}
          className="rounded-full w-16 h-16 bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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
  );
}