import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import React from "react";
import UserAvt from "./UserAvt";
import { Card } from "../ui/card";
import { Badge } from "lucide-react";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

const MessageItems = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const prevMess = messages[index - 1];
  const isGroupBreak =
    index === 0 ||
    message.senderId !== prevMess?.senderId ||
    new Date(message.createdAt).getTime() -
      new Date(prevMess?.createdAt || 0).getTime() >
      600000; // 10p

  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString()
  );
  return (
    <div
      className={cn(
        "flex gap-2 message-bounce",
        message.isOwn ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar */}
      {!message.isOwn && (
        <div className="w-8">
          {isGroupBreak && (
            <UserAvt
              type="chat"
              name={participant?.displayName ?? "GoMess"}
              avtUrl={participant?.avatarUrl ?? undefined}
            />
          )}
        </div>
      )}

      {/* message */}
      <div
        className={cn(
          "max-w-xs lg:max-w-md space-y-1 flex flex-col",
          message.isOwn ? "items-end" : "items-start"
        )}
      >
        <Card
          className={cn(
            "p-3",
            message.isOwn
              ? "bg-chat-bubble-sent border-0"
              : "bg-chat-bubble-received"
          )}
        >
          <p className="text-sm leading-relaxed wrap-break-word">
            {message.content}
          </p>
        </Card>

        {/* time sent */}
        {isGroupBreak && (
          <span className="text-xs text-muted-foreground px-1">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}

        {/* seen / delivered */}
        {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
          <Badge
            fontVariant="outline"
            className={cn(
              "text-xs px-1.5 py-0.5 h-4 border-0",
              lastMessageStatus === "seen"
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {lastMessageStatus}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MessageItems;
