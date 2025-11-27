import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = () => {
  const { conversations } = useChatStore();

  if (!conversations) return;

  console.log("length: ", conversations.length);

  const directConversations = conversations.filter(
    (conv) => conv.type === "direct"
  );
  console.log(directConversations);

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversations.map((convo) => (
        <DirectMessageCard convo={convo} key={convo._id} />
      ))}
    </div>
  );
};

export default DirectMessageList;
