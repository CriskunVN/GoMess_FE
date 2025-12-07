import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import { useState } from "react";
import UserAvt from "./UserAvt";
import { Card } from "../ui/card";

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Pin, Reply, Play, FileText, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "Đã gửi" | "Đã nhận" | "Đã xem";
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
        {/* Sender Name */}
        {!message.isOwn && isGroupBreak && selectedConvo.type !== "direct" && (
          <span className="text-xs text-muted-foreground ml-1">
            {participant?.displayName}
          </span>
        )}
        {/* Message Content */}
        {message.messageType === "image" ? (
          // Image Message
          <Dialog>
            <DialogTrigger asChild>
              <div
                className={cn(
                  "cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md",
                  message.isOwn ? "rounded-tr-sm" : "rounded-tl-sm"
                )}
                onClick={() => setShowDetails(!showDetails)}
              >
                <img
                  src={message.optimizedUrl || message.fileUrl || message.imgUrl || ""}
                  alt={message.fileInfo?.fileName || "Image"}
                  className="max-w-full max-h-64 object-cover rounded-2xl"
                  loading="lazy"
                />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-black/90 border-0">
              <img
                src={message.fileUrl || message.imgUrl || ""}
                alt={message.fileInfo?.fileName || "Image"}
                className="w-full h-full object-contain"
              />
            </DialogContent>
          </Dialog>
        ) : message.messageType === "video" ? (
          // Video Message
          <div
            className={cn(
              "cursor-pointer overflow-hidden rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md relative",
              message.isOwn ? "rounded-tr-sm" : "rounded-tl-sm"
            )}
            onClick={() => setShowDetails(!showDetails)}
          >
            <video
              src={message.fileUrl || ""}
              poster={message.thumbnailUrl || undefined}
              controls
              className="max-w-full max-h-64 rounded-2xl"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            {message.thumbnailUrl && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/50 rounded-full p-3">
                  <Play className="size-8 text-white fill-white" />
                </div>
              </div>
            )}
          </div>
        ) : message.messageType === "file" ? (
          // File Message
          <Card
            onClick={() => setShowDetails(!showDetails)}
            className={cn(
              "p-3 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md",
              message.isOwn
                ? "bg-chat-bubble-sent border-0 rounded-2xl rounded-tr-sm"
                : "bg-chat-bubble-received rounded-2xl rounded-tl-sm"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="size-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {message.fileInfo?.fileName || "File"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {message.fileInfo?.fileSize
                    ? formatFileSize(message.fileInfo.fileSize)
                    : "Unknown size"}
                </p>
              </div>
              <a
                href={message.fileUrl || ""}
                download={message.fileInfo?.fileName}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-accent rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="size-5 text-muted-foreground" />
              </a>
            </div>
            {message.content && (
              <p className="text-[15px] leading-relaxed wrap-break-word font-medium mt-2">
                {message.content}
              </p>
            )}
          </Card>
        ) : (
          // Text Message (default)
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
        )}

        {/* time sent */}
        {showDetails && (
          <span className="text-xs text-muted-foreground px-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        )}

      {/* seen / delivered / pending */}
      {message.isOwn &&
        (message._id === selectedConvo.lastMessage?._id ||
          showDetails ||
          message.isPending) &&
        (message.isPending ? (
          <span className="text-xs text-muted-foreground px-1">
            Đang gửi...
          </span>
        ) : (
          <div className="flex items-center gap-1">
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
             {/* Seen By Avatars */}
             {message._id === selectedConvo.lastMessage?._id && selectedConvo.seenBy.length > 0 && (
               <div className="flex -space-x-2 overflow-hidden">
                 {selectedConvo.seenBy
                   .filter((u) => {
                     const userId = typeof u === "string" ? u : u._id;
                     return userId !== useAuthStore.getState().user?._id;
                   })
                   .map((u) => {
                     const userId = typeof u === "string" ? u : u._id;
                     const userDetails =
                       selectedConvo.participants.find(
                         (p) => p._id === userId
                       ) || (typeof u === "object" ? u : { _id: userId, displayName: "?", avatarUrl: null });
                     
                     return (
                       <Avatar
                         key={userId}
                         className="inline-block h-4 w-4 rounded-full ring-2 ring-background"
                       >
                         <AvatarImage
                           src={userDetails.avatarUrl || undefined}
                         />
                         <AvatarFallback className="text-[6px]">
                           {userDetails.displayName?.[0]}
                         </AvatarFallback>
                       </Avatar>
                     );
                   })}
               </div>
             )}
          </div>
        ))}
    </div>

    {/* Action Menu (Right for received messages) */}
    {!message.isOwn && (
      <div className="opacity-0 group-hover:opacity-100 transition-opacity px-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <MoreVertical className="size-4 text-muted-foreground hover:text-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => console.log("Pin message", message._id)}
            >
              <Pin className="mr-2 size-4" />
              <span>Ghim</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => console.log("Reply message", message._id)}
            >
              <Reply className="mr-2 size-4" />
              <span>Trả lời</span>
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
