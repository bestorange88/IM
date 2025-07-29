import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, MoreVertical, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useToast } from "@/hooks/use-toast";

export default function CallsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');

  // 获取通话记录
  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["/api/calls"],
  });

  const handleStartCall = (contact: any, type: 'voice' | 'video') => {
    setActiveCall(contact);
    setCallType(type);
    toast({
      title: `发起${type === 'voice' ? '语音' : '视频'}通话`,
      description: `正在呼叫 ${contact.firstName || contact.email}...`,
    });
  };

  const handleEndCall = () => {
    setActiveCall(null);
    toast({
      title: "通话结束",
    });
  };

  const getCallIcon = (callType: string, direction: string, status: string) => {
    if (status === 'missed') {
      return <PhoneMissed className="w-4 h-4 text-red-500" />;
    }
    
    if (direction === 'incoming') {
      return <PhoneIncoming className="w-4 h-4 text-green-500" />;
    } else {
      return <PhoneOutgoing className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatCallDuration = (duration: number) => {
    if (duration === 0) return '未接通';
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <Header title="通话记录" />
      
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-amber-900">通话</h1>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-amber-600">加载中...</div>
          ) : calls.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-900 mb-2">暂无通话记录</h3>
              <p className="text-amber-600 mb-4">开始第一次通话吧</p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const mockContact = {
                      id: "demo",
                      firstName: "演示",
                      lastName: "用户",
                      email: "demo@taishan.com",
                      profileImageUrl: null
                    };
                    handleStartCall(mockContact, 'voice');
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  发起语音通话
                </Button>
                <Button
                  onClick={() => {
                    const mockContact = {
                      id: "demo",
                      firstName: "演示",
                      lastName: "用户", 
                      email: "demo@taishan.com",
                      profileImageUrl: null
                    };
                    handleStartCall(mockContact, 'video');
                  }}
                  variant="outline"
                  className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Video className="w-4 h-4 mr-2" />
                  发起视频通话
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {calls.map((call: any) => {
                const displayName = call.participant.firstName 
                  ? `${call.participant.firstName} ${call.participant.lastName || ''}`.trim()
                  : call.participant.email;

                return (
                  <div
                    key={call.id}
                    className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-amber-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={call.participant.profileImageUrl} />
                          <AvatarFallback className="bg-amber-100 text-amber-700">
                            {displayName[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-amber-900">{displayName}</h3>
                            {getCallIcon(call.type, call.direction, call.status)}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-amber-600">
                            <span>{call.type === 'video' ? '视频通话' : '语音通话'}</span>
                            <span>•</span>
                            <span>{formatCallDuration(call.duration)}</span>
                            <span>•</span>
                            <span>{new Date(call.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartCall(call.participant, call.type)}
                          className="text-amber-600 hover:bg-amber-50"
                        >
                          {call.type === 'video' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <Phone className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />

      {/* 通话界面覆盖层 */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <Avatar className="w-32 h-32 mx-auto mb-6">
              <AvatarImage src={activeCall.profileImageUrl} />
              <AvatarFallback className="text-4xl bg-amber-600">
                {(activeCall.firstName || activeCall.email)[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-2xl font-semibold mb-2">
              {activeCall.firstName 
                ? `${activeCall.firstName} ${activeCall.lastName || ''}`.trim()
                : activeCall.email}
            </h2>
            
            <p className="text-lg text-gray-300 mb-8">
              {callType === 'video' ? '视频通话中...' : '语音通话中...'}
            </p>
            
            <div className="flex justify-center space-x-8">
              <Button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white"
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}