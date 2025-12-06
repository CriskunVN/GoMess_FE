import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/useChatStore";
import ChatWellcomeScreen from "./ChatWellcomeScreen";
import MessageItems from "./MessageItems";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatMessageTime } from "@/lib/utils";

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

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeConversationId]);

  if (!selectedConvo) {
    return <ChatWellcomeScreen />;
  }
  if (!messages?.length) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Chưa có tin nhắn nào trong cuộc trò chuyện này.
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
