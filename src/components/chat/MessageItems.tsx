import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import React, { useState } from "react";
import UserAvt from "./UserAvt";
import { Card } from "../ui/card";

import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Pin } from "lucide-react";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "Đã gửi" | "Đã nhận";
}

const MessageItems = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const [showDetails, setShowDetails] = useState(false);
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
        "flex gap-2 message-bounce mt-1 group items-center",
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

      {/* Action Menu (Left for sent messages) */}
      {message.isOwn && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <MoreVertical className="size-4 text-muted-foreground hover:text-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log("Pin message", message._id)}>
                <Pin className="mr-2 size-4" />
                <span>Ghim</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => console.log("Recall message", message._id)}
              >
                <Trash2 className="mr-2 size-4" />
                <span>Thu hồi</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          onClick={() => setShowDetails(!showDetails)}
          className={cn(
            "p-3 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md",
            message.isOwn
              ? "bg-chat-bubble-sent border-0 rounded-2xl rounded-tr-sm"
              : "bg-chat-bubble-received rounded-2xl rounded-tl-sm"
          )}
        >
          <p className="text-[15px] leading-relaxed wrap-break-word font-medium">
            {message.content}
          </p>
        </Card>

        {/* time sent */}
        {showDetails && (
          <span className="text-xs text-muted-foreground px-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}

        {/* seen / delivered / pending */}
        {message.isOwn && (message._id === selectedConvo.lastMessage?._id || showDetails || message.isPending) && (
          message.isPending ? (
             <span className="text-xs text-muted-foreground px-1">Đang gửi...</span>
          ) : (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0 animate-in fade-in slide-in-from-top-1 duration-200",
                lastMessageStatus === "Đã gửi"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {lastMessageStatus}
            </Badge>
          )
        )}
      </div>

      {/* Action Menu (Right for received messages) */}
      {!message.isOwn && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <MoreVertical className="size-4 text-muted-foreground hover:text-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => console.log("Pin message", message._id)}>
                <Pin className="mr-2 size-4" />
                <span>Ghim</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => console.log("Recall message", message._id)}
              >
                <Trash2 className="mr-2 size-4" />
                <span>Thu hồi</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default MessageItems;
