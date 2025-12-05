import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2, Check } from "lucide-react";
import { chatService } from "@/services/chatService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface User {
  _id: string;
  displayName: string;
  avatarUrl?: string;
  username: string;
}

const AddFriend = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await chatService.searchUsers(query);
      setUsers(Array.isArray(data) ? data : []);
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
      await chatService.sendFriendRequest(userId);
      toast.success("Đã gửi lời mời kết bạn");
      // Optional: Update UI to show sent state
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
          variant="ghost"
          className="w-full justify-start gap-2 px-2 text-muted-foreground hover:text-foreground"
        >
          <UserPlus className="size-6" />
          <span className="text-base">Thêm bạn bè</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle>Thêm bạn bè</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nhập tên hoặc email..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tìm"}
            </Button>
          </div>

          <div className="h-[300px] overflow-y-auto space-y-2">
            {users.length === 0 && !loading && query && (
              <div className="text-center text-muted-foreground py-8">
                Không tìm thấy người dùng nào
              </div>
            )}
            
            {users.map((user) => (
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
                    <span className="text-xs text-muted-foreground">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={requesting === user._id}
                  onClick={() => handleAddFriend(user._id)}
                >
                  {requesting === user._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriend;