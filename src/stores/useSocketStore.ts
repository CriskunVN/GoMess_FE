import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  pendingFriendRequests: [],
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
        // Reset seenBy khi có tin nhắn mới để tránh hiện avatar cũ
        seenBy: message.sender ? [message.sender] : [],
      };

      useChatStore.getState().updateConversation(updateConversation);
    });

    // new conversation event (khi accept friend request hoặc tạo conversation mới)
    socket.on("new-conversation", (conversation) => {
      console.log("[socket] new-conversation received", conversation._id);
      useChatStore.getState().addConversation(conversation);
      
      // Join socket room cho conversation mới
      socket.emit("join-conversation", { conversationId: conversation._id });
    });

    // new friend request event (real-time notification)
    socket.on("new-friend-request", (request) => {
      console.log("[socket] new-friend-request received", request);
      set((state) => ({
        pendingFriendRequests: [...state.pendingFriendRequests, request],
      }));
    });

    // message read event
    socket.on("message-read", ({ conversationId, seenBy }) => {
      // console.log("[socket] message-read received", { conversationId, seenBy });
      // Tìm conversation hiện tại trong store để update
      const currentConvos = useChatStore.getState().conversations;
      const targetConvo = currentConvos.find((c) => c._id === conversationId);

      if (targetConvo) {
        // Khử trùng lặp seenBy
        const uniqueSeenBy = Array.from(
          new Map(
            seenBy.map((u: any) => {
              const id = typeof u === "string" ? u : u._id;
              return [id, u];
            })
          ).values()
        );

        useChatStore.getState().updateConversation({
          ...targetConvo,
          seenBy: uniqueSeenBy as any,
        });
      }
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
  clearPendingFriendRequests: () => {
    set({ pendingFriendRequests: [] });
  },
}));

