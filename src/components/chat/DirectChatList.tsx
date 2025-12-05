import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = ({ searchTerm = "" }: { searchTerm?: string }) => {
  const { conversations } = useChatStore();
  const { user } = useAuthStore();

  if (!conversations || !user) return;

  const directConversations = conversations.filter((conv) => {
    if (conv.type !== "direct") return false;
    const otherUser = conv.participants.find((p) => p._id !== user._id);
    return otherUser?.displayName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversations.map((convo) => (
        <DirectMessageCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default DirectMessageList;
