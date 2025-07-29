import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SearchUser {
  id: string;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  status: string;
  isOnline: boolean;
}

export default function AddFriendDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 搜索用户
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });
      if (!response.ok) throw new Error('搜索失败');
      return response.json();
    },
    enabled: searchQuery.trim().length > 0,
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      return await apiRequest("/api/friends", {
        method: "POST",
        body: { friendId },
      });
    },
    onSuccess: (data) => {
      if (data.multiple) {
        // 多个匹配结果，让用户选择
        return;
      }
      
      toast({
        title: "添加道友成功",
        description: data.message || "已成功添加到您的道友圈",
      });
      setSearchQuery("");
      setSelectedUser(null);
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "添加失败",
        description: error.message || "无法添加该道友",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      addFriendMutation.mutate(selectedUser.id);
    }
  };

  const handleSelectUser = (user: SearchUser) => {
    setSelectedUser(user);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white rounded-full">
          <UserPlus className="w-4 h-4 mr-2" />
          添加道友
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white/95 backdrop-blur-sm border-amber-200">
        <DialogHeader>
          <DialogTitle className="text-amber-900">添加新道友</DialogTitle>
          <DialogDescription className="text-amber-700">
            通过昵称、用户名或邮箱搜索道友并添加到联系人
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4" />
            <Input
              placeholder="搜索昵称、用户名或邮箱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-200"
              type="text"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 w-4 h-4 animate-spin" />
            )}
          </div>

          {/* 搜索结果 */}
          {searchQuery.trim() && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((user: SearchUser) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id 
                        ? 'bg-amber-100 border-amber-300 border' 
                        : 'bg-gray-50 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {user.nickname?.[0] || user.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {user.nickname || user.username}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          @{user.username} • {user.email}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.isOnline 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {user.isOnline ? '在线' : '离线'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>未找到匹配的道友</p>
                  <p className="text-sm">请尝试其他搜索词</p>
                </div>
              )}
            </div>
          )}

          {/* 添加按钮 */}
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  setSearchQuery("");
                  setSelectedUser(null);
                }}
                className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!selectedUser || addFriendMutation.isPending}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
              >
                {addFriendMutation.isPending ? "添加中..." : "添加道友"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}