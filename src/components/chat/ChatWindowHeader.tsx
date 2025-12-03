import { useChatStore } from "@/stores/useChatStore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthStore";
import { Separator } from "@radix-ui/react-separator";
import UserAvt from "./UserAvt";
import GroupChatAvt from "./GroupChatAvt";
import {
  SeparatorHorizontal,
  SeparatorVertical,
  SeparatorVerticalIcon,
} from "lucide-react";
import { useSocketStore } from "@/stores/useSocketStore";
import StatusBadge from "./StatusBadge";

const ChatWindownHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  let otherUser;
  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 px-4 py-2 w-full">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }
  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;
    if (!user || !otherUser) return;
  }

  return (
    <>
      <header className="sticky top-0 z-10 px-4 py-2 flex items-center bg-background">
        <div className="flex items-center gap-2 w-full">
          <SidebarTrigger className="-ml-1 text-foreground" />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 w-[1px] bg-neutral-300 shrink-0"
          />
          <div className="p-2 w-full flex items-center gap-3">
            {/* avatar */}
            <div className="relative">
              {chat.type === "direct" ? (
                <>
                  <UserAvt
                    type={"sidebar"}
                    name={otherUser?.displayName || "GoMess"}
                    avtUrl={otherUser?.avatarUrl || undefined}
                  />
                  {/* Socket io : Display online / offline */}
                  <StatusBadge
                    status={
                      onlineUsers.includes(otherUser?._id ?? "")
                        ? "online"
                        : "offline"
                    }
                  />
                </>
              ) : (
                <GroupChatAvt participants={chat.participants} type="sidebar" />
              )}
            </div>

            {/* NAME */}
            <h2 className="font-semibold text-foreground">
              {" "}
              {chat.type === "direct"
                ? otherUser?.displayName
                : chat.group?.name}
            </h2>
          </div>
        </div>
      </header>
    </>
  );
};

export default ChatWindownHeader;
