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

interface User {
  _id: string;
  displayName: string;
  avatarUrl?: string;
  username: string;
}

import { cn } from "@/lib/utils";

const AddFriend = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [seedRequest , setSeedRequest] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friendsList = await friendService.fetchFriends();
        setFriends(friendsList.map((f: any) => f._id));
        console.log(friendsList);
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
          (user) => user.id !== currentUser?._id
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
            "w-full justify-start gap-2 px-2 text-muted-foreground hover:text-foreground",
            className
          )}
        >
          <UserPlus className="size-6" />
          <span className="text-base">Thêm bạn bè</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle>Bạn bè</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="add-friend" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-friend">Kết bạn</TabsTrigger>
            <TabsTrigger value="requests">Lời mời</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-friend" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nhập tên hoặc email..."
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
                    key={user.id}
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
                    {friends.includes(user.id) ? (
                      <Button size="sm" variant="outline" disabled className="text-green-500">
                        <Check className="h-4 w-4 mr-1" />
                        Đã kết bạn
                      </Button>
                    ) : (
                      seedRequest.includes(user.id) ? (
                        <Button size="sm" variant="outline" disabled className="text-red-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đã gửi
                        </Button>
                      ) : ( 
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={requesting === user.id}
                        onClick={() => handleAddFriend(user.id)}
                      >
                        {requesting === user.id ? (
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
            <FriendRequests />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriend;