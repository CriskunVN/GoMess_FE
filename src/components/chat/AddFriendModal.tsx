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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils"; // Giả sử bạn có utility này từ shadcn
import { Loader2, Search, Send } from "lucide-react"; // Import icon từ lucide-react cho đẹp

interface AddFriendModalProps {
  /**
   * Tùy chọn: Truyền vào 1 ReactNode để làm nút kích hoạt thay vì nút mặc định
   * Ví dụ: Khi dùng trong SidebarGroupAction
   */
  customTrigger?: React.ReactNode;
}

const AddFriendModal: React.FC<AddFriendModalProps> = ({ customTrigger }) => {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<
    Array<{ _id: string; displayName: string; avatarUrl?: string | null }>
  >([]);
  const [query, setQuery] = useState("");
  const [firstMessage, setFirstMessage] = useState("");

  // State mới: Lưu ID người được chọn thay vì gửi ngay
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Reset state khi đóng modal
  useEffect(() => {
    if (!open) {
      setQuery("");
      setFirstMessage("");
      setSelectedFriendId(null);
    }
  }, [open]);

  // Load danh sách bạn bè khi mở modal
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        setListLoading(true);
        const data = await chatService.fetchFriends();
        setFriends(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn("Failed to load friends", e);
      } finally {
        setListLoading(false);
      }
    };
    load();
  }, [open]);

  const refreshConversations = async () => {
    try {
      await useChatStore.getState().fetchConversations();
    } catch (e) {
      console.warn("Failed to refresh conversations", e);
    }
  };

  const handleStartChat = async () => {
    if (!selectedFriendId) return;
    try {
      setLoading(true);
      // Gửi tin nhắn mở đầu (nếu có)
      await chatService.sendDirectMessage(
        selectedFriendId,
        firstMessage || "Hi 👋",
        ""
      );
      await refreshConversations();
      setOpen(false);
    } catch (err) {
      console.error("Failed to start direct message", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.displayName?.toLowerCase().includes(q));
  }, [friends, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* LOGIC TRIGGER:
        Nếu có customTrigger (từ Sidebar) thì dùng nó.
        Nếu không thì dùng nút tròn mặc định.
      */}
      {/* LOGIC TRIGGER:
        Nếu có customTrigger (từ Sidebar) thì dùng nó.
        Nếu không thì dùng nút tròn mặc định.
      */}
      {customTrigger ? (
        <DialogTrigger asChild>{customTrigger}</DialogTrigger>
      ) : (
        <div className="flex justify-end px-2">
          <DialogTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              className="h-6 w-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 flex items-center justify-center cursor-pointer"
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
            </span>
          </DialogTrigger>
        </div>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo cuộc trò chuyện mới</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bạn bè..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Friend List */}
          <div className="h-64 overflow-y-auto rounded-md border bg-muted/20">
            {listLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Không tìm thấy bạn bè nào.
              </div>
            ) : (
              <ul className="p-1 space-y-1">
                {filteredFriends.map((f) => {
                  const isSelected = selectedFriendId === f._id;
                  return (
                    <li
                      key={f._id}
                      onClick={() => setSelectedFriendId(f._id)}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors border",
                        isSelected
                          ? "bg-emerald-50 border-emerald-500 dark:bg-emerald-950/30"
                          : "bg-transparent border-transparent hover:bg-accent"
                      )}
                    >
                      <Avatar className="h-9 w-9 border">
                        {f.avatarUrl ? (
                          <AvatarImage src={f.avatarUrl} alt={f.displayName} />
                        ) : (
                          <AvatarFallback>
                            {f.displayName?.[0]?.toUpperCase() ?? "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">
                          {f.displayName}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          ID: {f._id}
                        </span>
                      </div>

                      {/* Checkmark icon if selected */}
                      {isSelected && (
                        <div className="ml-auto text-emerald-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Message Input - Chỉ hiện khi đã chọn người */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Lời nhắn đầu tiên (Tùy chọn)
            </label>
            <Input
              placeholder={
                selectedFriendId
                  ? "Say hi 👋"
                  : "Chọn một người bạn để bắt đầu..."
              }
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              disabled={!selectedFriendId}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleStartChat}
            disabled={!selectedFriendId || loading}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Bắt đầu chat
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
