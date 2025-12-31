import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/useChatStore";
import ChatWellcomeScreen from "./ChatWellcomeScreen";
import MessageItems from "./MessageItems";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatMessageTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, MessageCircleHeart } from "lucide-react";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
  } = useChatStore();
  const { user } = useAuthStore();
  const messages = allMessages[activeConversationId!]?.items ?? [];
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Debug: track message changes
  useEffect(() => {
    console.log("[ChatWindowBody] messages changed:", {
      activeConversationId,
      messageCount: messages.length,
      lastMessageId: messages[messages.length - 1]?._id,
    });
  }, [messages, activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversationId]);

  if (!selectedConvo) {
    return <ChatWellcomeScreen />;
  }

  // Hiện màn hình chào mừng cho conversation mới chưa có tin nhắn
  if (!messages?.length) {
    const otherUser = selectedConvo.participants.find(
      (p) => p._id !== user?._id
    );
    const displayName = selectedConvo.type === "direct" 
      ? otherUser?.displayName 
      : selectedConvo.group?.name;
    const avatarUrl = selectedConvo.type === "direct" 
      ? otherUser?.avatarUrl 
      : null;

    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center text-center space-y-6 max-w-md">
          {/* Avatar với hiệu ứng */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-full blur-xl scale-110 animate-pulse" />
            <Avatar className="size-28 border-4 border-primary/20 shadow-lg relative">
              <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                {displayName?.charAt(0)?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-2 shadow-lg">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
          </div>

          {/* Thông điệp chào mừng */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {selectedConvo.type === "direct" 
                ? `Bạn và ${displayName} đã trở thành bạn bè!`
                : `Chào mừng đến nhóm ${displayName}!`
              }
            </h3>
            <p className="text-muted-foreground">
              {selectedConvo.type === "direct" 
                ? "Hãy gửi lời chào để bắt đầu cuộc trò chuyện 👋"
                : "Hãy gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện!"
              }
            </p>
          </div>

          {/* Icon trang trí */}
          <div className="flex items-center gap-3 text-primary/60">
            <MessageCircleHeart className="size-6" />
            <span className="text-sm font-medium">Xin chào!</span>
            <MessageCircleHeart className="size-6 scale-x-[-1]" />
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = selectedConvo.unreadCounts?.[user?._id ?? ""] || 0;
  const unreadStartIndex = messages.length - unreadCount;

  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar">
        {messages.map((m, index) => {
          const prevMess = messages[index - 1];
          const isTimeGap =
            index > 0 &&
            new Date(m.createdAt).getTime() -
              new Date(prevMess?.createdAt || 0).getTime() >
              15 * 60 * 1000; // 15 minutes

          const isUnreadBoundary = index === unreadStartIndex && unreadCount > 0;

          return (
            <div key={m._id ?? index} className="flex flex-col">
              {/* Time Separator */}
              {isTimeGap && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                    {formatMessageTime(new Date(m.createdAt))}
                  </span>
                </div>
              )}

              {/* Unread Separator */}
              {isUnreadBoundary && (
                <div className="flex items-center justify-center my-4 gap-2">
                  <div className="h-[1px] flex-1 bg-red-500/50"></div>
                  <span className="text-xs text-red-500 font-medium">
                    Tin nhắn chưa đọc
                  </span>
                  <div className="h-[1px] flex-1 bg-red-500/50"></div>
                </div>
              )}

              <MessageItems
                message={m}
                index={index}
                messages={messages}
                selectedConvo={selectedConvo}
                lastMessageStatus={
                  selectedConvo.seenBy.some((u) => u._id !== user?._id)
                    ? "Đã xem"
                    : "Đã gửi"
                }
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindowBody;

