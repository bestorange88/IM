import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search, Phone, Video, MessageCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/common/Header";
import BottomNavigation from "@/components/BottomNavigation";
import AddFriendDialog from "@/components/AddFriendDialog";
import { useLocation } from "wouter";

const defaultContacts = [
  {
    id: "system1",
    username: "张道长",
    nickname: "张道长",
    avatar: "https://cdn-icons-png.flaticon.com/512/921/921071.png",
  },
  {
    id: "system2",
    username: "李玄",
    nickname: "李玄子",
    avatar: "https://cdn-icons-png.flaticon.com/512/921/921087.png",
  },
];

export default function ContactsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);

  const queryClient = useQueryClient();
  const { data: friends = [], refetch } = useQuery({
    queryKey: ["/api/friends"],
  });

  useEffect(() => {
    const combined = [...defaultContacts, ...(Array.isArray(friends) ? friends : [])];
    const filtered = combined.filter(
      (f, i, arr) => arr.findIndex((x) => x.id === f.id) === i // 去重
    );
    setContacts(filtered);
  }, [friends]);

  const filteredFriends = contacts.filter((friend: any) => {
    const name = friend.nickname || friend.username || friend.email || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleStartCall = (contact: any, type: "voice" | "video") => {
    toast({
      title: `发起${type === "voice" ? "语音" : "视频"}通话`,
      description: `正在呼叫 ${contact.nickname || contact.username}...`,
    });
  };

  const handleStartChat = (contact: any) => {
    navigate(`/chat?contact=${contact.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50">
      <Header title="联系人" />
      <div className="pt-16 pb-20 px-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-amber-900">道友圈</h1>
          <AddFriendDialog onSuccess={() => refetch()} />
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
          <Input
            placeholder="搜索道友..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-200"
          />
        </div>

        {filteredFriends.length === 0 ? (
          <div className="text-center text-amber-700">暂无道友，去添加一位吧！</div>
        ) : (
          <div className="space-y-4">
            {filteredFriends.map((contact: any) => (
              <div
                key={contact.id}
                className="flex items-center justify-between bg-white p-3 rounded shadow"
              >
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleStartChat(contact)}>
                  <Avatar>
                    <img src={contact.avatar || ""} alt="" className="w-10 h-10 rounded-full" />
                  </Avatar>
                  <div>
                    <div className="font-bold text-amber-900">{contact.nickname || contact.username}</div>
                    <div className="text-sm text-gray-400">{contact.email || "道友"}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Phone className="text-amber-600 cursor-pointer" onClick={() => handleStartCall(contact, "voice")} />
                  <Video className="text-amber-600 cursor-pointer" onClick={() => handleStartCall(contact, "video")} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}