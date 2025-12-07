export interface Participant {
  _id: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface SeenUser {
  _id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface Group {
  name: string;
  createdBy: string;
}

export interface LastMessage {
  _id: string;
  content: string;
  createdAt: string;
  sender: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface Conversation {
  _id: string;
  type: "direct" | "group";
  group: Group;
  participants: Participant[];
  lastMessageAt: string;
  seenBy: SeenUser[];
  lastMessage: LastMessage | null;
  unreadCounts: Record<string, number>; // key = userId, value = unread count
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface FileInfo {
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number; // for video/audio
}

export type MessageType = "text" | "image" | "video" | "file";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType?: MessageType;
  fileUrl?: string | null;
  thumbnailUrl?: string | null;
  optimizedUrl?: string | null;
  fileInfo?: FileInfo | null;
  imgUrl?: string | null; // legacy support
  updatedAt?: string | null;
  createdAt: string;
  isOwn?: boolean;
  isPending?: boolean;
}
