import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Video } from "lucide-react";

interface Props {
  callerName: string;
  status: "incoming" | "calling" | "in-call";
  onAccept: () => void;
  onReject: () => void;
  onHangup: () => void;
  isVideo?: boolean;
}

export default function CallOverlay({
  callerName,
  status,
  onAccept,
  onReject,
  onHangup,
  isVideo = false,
}: Props) {
  useEffect(() => {
    const audio = new Audio("/sounds/ringtone.mp3");
    if (status === "incoming" || status === "calling") {
      audio.loop = true;
      audio.play().catch(() => {});
    }
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [status]);

  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 text-white">
      <div className="text-lg mb-4">
        {status === "incoming" && `${callerName} 呼叫中...`}
        {status === "calling" && `等待 ${callerName} 接听...`}
        {status === "in-call" && `与 ${callerName} 通话中`}
      </div>

      {status === "incoming" && (
        <div className="flex gap-6">
          <Button onClick={onAccept} className="bg-green-500 hover:bg-green-600">
            <Phone className="w-5 h-5 mr-2" /> 接听
          </Button>
          <Button onClick={onReject} className="bg-red-500 hover:bg-red-600">
            <PhoneOff className="w-5 h-5 mr-2" /> 拒绝
          </Button>
        </div>
      )}

      {status === "calling" && (
        <Button onClick={onReject} className="bg-red-500 hover:bg-red-600">
          <PhoneOff className="w-5 h-5 mr-2" /> 取消呼叫
        </Button>
      )}

      {status === "in-call" && (
        <Button onClick={onHangup} className="bg-red-600 hover:bg-red-700">
          <PhoneOff className="w-5 h-5 mr-2" /> 挂断
        </Button>
      )}

      <div className="mt-6 text-xs opacity-70">{isVideo ? "视频通话" : "音频通话"}</div>
    </div>
  );
}