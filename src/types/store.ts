import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { User } from "./user";

// Interface Auth
export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  clearState: () => void;
  setAccessToken: (accessToken: string) => void;
  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface ThemeStore {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<
    string,
    {
      items: Message[];
      hasMore: boolean;
      nextCursor?: string | null;
    }
  >;
  activeConversationId: string | null;
  convoLoading: boolean;
  messageLoading: boolean;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?: string) => Promise<void>;
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string,
    file?: File
  ) => Promise<void>;
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string,
    file?: File
  ) => Promise<void>;
  //add message
  addMessage: (message: Message) => Promise<void>;

  //update convo
  updateConversation: (convo: Conversation) => void;
  //add convo
  addConversation: (conversation: Conversation) => void;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  pendingMessages: Message[];
  sendPendingMessages: () => Promise<void>;
}

export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  pendingFriendRequests: any[];
  connectSocket: () => void;
  disconnectSocket: () => void;
  clearPendingFriendRequests: () => void;
}
