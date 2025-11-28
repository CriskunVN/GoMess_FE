import { useChatStore } from "@/stores/useChatStore";
import ChatWellcomeScreen from "./ChatWellcomeScreen";
import MessageItems from "./MessageItems";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
  } = useChatStore();
  const messages = allMessages[activeConversationId!]?.items ?? [];
  const selectedConvo = conversations.find(
    (c) => c._id === activeConversationId
  );
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
  return (
    <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
      <div className="flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar">
        {messages.map((m, index) => (
          <MessageItems
            key={m._id ?? index}
            message={m}
            index={index}
            messages={messages}
            selectedConvo={selectedConvo}
            lastMessageStatus="delivered"
          />
        ))}
      </div>
    </div>
  );
};

export default ChatWindowBody;
