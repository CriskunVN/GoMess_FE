import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return;

    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    set({ socket });
    // connect events
    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
    });

    // online users
    socket.on("online-users", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });

    // new message event
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      console.log("[socket] new-message received", {
        messageId: message?._id,
        conversationId: message?.conversationId,
      });
      useChatStore.getState().addMessage(message);

      const lastMessage = {
        _id: message._id,
        content: message.content,
        createdAt: message.createdAt,
        sender: message.sender,
      };

      const updateConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        useChatStore.getState().markConversationAsRead(message.conversationId);
      }

      useChatStore.getState().updateConversation(updateConversation);
    });



    // handle connection error
    socket.on("connect_error", (err) => {
      console.log("Lỗi kết nối:", err.message); // Nó sẽ hiện lý do middleware từ chối
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      console.log("Đã ngắt kết nối với socket");
      set({
        socket: null,
      });
    }
  },
}));
