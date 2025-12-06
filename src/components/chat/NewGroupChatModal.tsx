import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { chatService } from "@/services/chatService";
import { useChatStore } from "@/stores/useChatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; // Cần import Badge để hiển thị tag thành viên
import { Check, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { friendService } from "@/services/friendService";

interface NewGroupChatModalProps {
  customTrigger?: React.ReactNode;
}

const NewGroupChatModal: React.FC<NewGroupChatModalProps> = ({
  customTrigger,
}) => {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  // Data
  const [friends, setFriends] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [query, setQuery] = useState("");

  // Selection
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);

  // Reset state khi đóng/mở modal
  useEffect(() => {
    if (open) {
      setGroupName("");
      setSelectedMembers([]);
      setQuery("");
      loadFriends();
    }
  }, [open]);

  const loadFriends = async () => {
    try {
      setListLoading(true);
      const data = await friendService.fetchFriends();
      setFriends(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("Failed to load friends", e);
    } finally {
      setListLoading(false);
    }
  };

  // Logic chọn/bỏ chọn thành viên
  const toggleMember = (member: any) => {
    setSelectedMembers((prev) => {
      const exists = prev.find((m) => m._id === member._id);
      if (exists) {
        return prev.filter((m) => m._id !== member._id);
      } else {
        return [...prev, member];
      }
    });
  };

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.displayName?.toLowerCase().includes(q));
  }, [friends, query]);

  const handleCreate = async () => {
    // Validate: Tên nhóm + ít nhất 2 thành viên (thường nhóm cần > 2 người bao gồm cả chủ phòng)
    if (!groupName.trim() || selectedMembers.length < 1) return;

    try {
      setLoading(true);
      const memberIds = selectedMembers.map((m) => m._id);

      await chatService.createGroupConversation(groupName, memberIds);

      // Refresh lại danh sách chat ở sidebar
      await useChatStore.getState().fetchConversations();

      setOpen(false);
    } catch (err) {
      console.error("Failed to create group conversation", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* TRIGGER: Xử lý custom trigger để tránh lỗi lồng button */}
      {customTrigger ? (
        <DialogTrigger asChild>{customTrigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="
              h-6 w-6 p-0 rounded-full 
              bg-emerald-600 hover:bg-emerald-500 
              text-white shadow-sm flex items-center justify-center
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Tạo nhóm mới</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 overflow-y-auto">
          {/* 1. Nhập tên nhóm */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Tên nhóm</label>
            <Input
              placeholder="Ví dụ: Team Dự Án..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* 2. Hiển thị thành viên đã chọn (Tags) */}
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((m) => (
                <Badge
                  key={m._id}
                  variant="secondary"
                  className="pl-1 pr-2 py-1 flex items-center gap-1"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={m.avatarUrl} />
                    <AvatarFallback className="text-[9px]">
                      {m.displayName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{m.displayName}</span>
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-500 ml-1"
                    onClick={() => toggleMember(m)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* 3. Tìm kiếm và Danh sách bạn bè */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Thêm thành viên</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm bạn bè..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="border rounded-md h-48 overflow-y-auto bg-muted/10 p-1">
              {listLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Không tìm thấy bạn bè.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredFriends.map((friend) => {
                    const isSelected = selectedMembers.some(
                      (m) => m._id === friend._id
                    );
                    return (
                      <div
                        key={friend._id}
                        onClick={() => toggleMember(friend)}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                          isSelected
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "hover:bg-accent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={friend.avatarUrl} />
                            <AvatarFallback>
                              {friend.displayName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm font-medium">
                            {friend.displayName}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-right">
              Đã chọn: {selectedMembers.length} thành viên
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleCreate}
            disabled={loading || !groupName || selectedMembers.length < 1}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {loading ? "Đang tạo..." : "Tạo nhóm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatModal;
