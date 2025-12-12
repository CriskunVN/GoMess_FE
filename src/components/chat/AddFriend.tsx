import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2, Check } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { friendService } from "@/services/friendService";
import FriendRequests from "./FriendRequests";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";

interface User {
  _id: string;
  displayName: string;
  avatarUrl?: string;
  username: string;
}

import { cn } from "@/lib/utils";

const AddFriend = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("@");
  const [loading, setLoading] = useState(false);
  const [seedRequest , setSeedRequest] = useState<string[]>([]);
  // dùng để lưu danh sách người dùng tìm kiếm
  const [users, setUsers] = useState<User[]>([]);
  // dùng để lưu danh sách bạn bè
  const [friends, setFriends] = useState<string[]>([]);
  // dùng để chặn người dùng gửi lời mời kết bạn cho người đã gửi lời mời trước đó  
  const [requesting, setRequesting] = useState<string | null>(null);
  const [receivedCount, setReceivedCount] = useState(0);
  const currentUser = useAuthStore((state) => state.user);
  const { pendingFriendRequests, clearPendingFriendRequests } = useSocketStore();

  // Listen to real-time friend requests from socket
  useEffect(() => {
    if (pendingFriendRequests.length > 0) {
      setReceivedCount((prev) => prev + pendingFriendRequests.length);
      toast.info(`Bạn có ${pendingFriendRequests.length} lời mời kết bạn mới!`);
      clearPendingFriendRequests();
    }
  }, [pendingFriendRequests, clearPendingFriendRequests]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friendsList = await friendService.fetchFriends();
        setFriends(friendsList.map((f: any) => f._id));
        const { sent, received } = await friendService.fetchFriendRequests();
        const seedRequests = Array.isArray(sent)
          ? sent.map((r: any) => r.to._id)
          : [];
        setSeedRequest(seedRequests);
        if (Array.isArray(received)) {
          setReceivedCount(received.length);
        }
      } catch (error) {
        console.error("Failed to fetch friends", error);
      }
    };
    fetchFriends();
  }, []);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setUsers([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await friendService.searchUsers(query);
      if (Array.isArray(data)) {
        const filteredUsers = data.filter(
          (user) => user._id !== currentUser?._id
        );
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Failed to search users", error);
      toast.error("Không thể tìm kiếm người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    setRequesting(userId);
    try {
      await friendService.sendFriendRequest(userId);
      toast.success("Đã gửi lời mời kết bạn");
      setSeedRequest((prev) => [...prev, userId]);
    } catch (error) {
      console.error("Failed to send friend request", error);
      toast.error("Gửi lời mời thất bại");
    } finally {
      setRequesting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 px-2 text-muted-foreground hover:text-foreground relative",
            className
          )}
        >
          <div className="relative">
            <UserPlus className="size-6" />
          </div>
          <span className="text-base">Thêm bạn bè</span>
          {receivedCount > 0 && (
            <span className="absolute top-1/2 -translate-y-1/2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle>Bạn bè</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="add-friend" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-friend">Kết bạn</TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              Lời mời
              {receivedCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {receivedCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-friend" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nhập tên hoặc email...(@username )"
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                {loading && (
                  <div className="flex items-center justify-center px-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="h-[300px] overflow-y-auto space-y-2">
                {users.length === 0 && !loading && query && (
                  <div className="text-center text-muted-foreground py-8">
                    Không tìm thấy người dùng nào
                  </div>
                )}
                
                {users.map((user: any) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>
                          {user.displayName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.displayName}</span>
                        <span className="text-sm text-muted-foreground">
                          @{user.username}
                        </span>
                      </div>
                    </div>
                    {friends.includes(user._id) ? (
                      <Button size="sm" variant="outline" disabled className="text-green-500">
                        <Check className="h-4 w-4 mr-1" />
                        Đã kết bạn
                      </Button>
                    ) : (
                      seedRequest.includes(user._id) ? (
                        <Button size="sm" variant="outline" disabled className="text-red-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đã gửi
                        </Button>
                      ) : ( 
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={requesting === user._id}
                        onClick={() => handleAddFriend(user._id)}
                      >
                        {requesting === user._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                    ))}
                  </div>
                ))}
                
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <FriendRequests onRequestUpdate={() => setReceivedCount((prev) => Math.max(0, prev - 1))} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriend;