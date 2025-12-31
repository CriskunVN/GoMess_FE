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
      
      // Function to join all conversation rooms
      const joinAllRooms = () => {
        const conversations = useChatStore.getState().conversations;
        if (conversations.length > 0) {
          console.log("[socket] Joining conversation rooms:", conversations.length);
          conversations.forEach((conv) => {
            socket.emit("join-conversation", { conversationId: conv._id });
          });
          return true;
        }
        return false;
      };
      
      // Try to join rooms immediately
      if (!joinAllRooms()) {
        console.log("[socket] No conversations yet, will retry in 1s...");
        // Retry after fetchConversations has time to complete
        setTimeout(() => {
          if (joinAllRooms()) {
            console.log("[socket] Successfully joined rooms on retry");
          } else {
            console.log("[socket] Still no conversations after retry");
          }
        }, 1000);
      }
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


    // new group chat
    socket.on("new-group", (conv) => {
      console.log("[socket] new-group received", conv._id);
      console.log("[socket] Adding conversation and joining room for group:", conv._id);
      useChatStore.getState().addConversation(conv);
      // Join socket room cho group mới
      socket.emit("join-conversation", { conversationId: conv._id });
      console.log("[socket] Emitted join-conversation for:", conv._id);
    });


    // handle connection error
    socket.on("connect_error", (err) => {
      console.log("Lỗi kết nối:", err.message);
    });
    
    // handle disconnect
    socket.on("disconnect", (reason) => {
      console.log("[socket] Disconnected! Reason:", reason);
    });
    
    // handle reconnect - rejoin all rooms
    socket.io.on("reconnect", (attemptNumber) => {
      console.log("[socket] Reconnected after", attemptNumber, "attempts");
      // Rejoin all conversation rooms after reconnect
      const conversations = useChatStore.getState().conversations;
      if (conversations.length > 0) {
        console.log("[socket] Rejoining", conversations.length, "rooms after reconnect");
        conversations.forEach((conv) => {
          socket.emit("join-conversation", { conversationId: conv._id });
        });
      }
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
  joinConversationRooms: (conversationIds?: string[]) => {
    const socket = get().socket;
    if (!socket || !socket.connected) {
      console.log("[socket] Cannot join rooms - socket not connected");
      return;
    }
    
    // If specific IDs provided, join those; otherwise join all conversations
    const idsToJoin = conversationIds || useChatStore.getState().conversations.map(c => c._id);
    
    if (idsToJoin.length > 0) {
      console.log("[socket] Joining conversation rooms:", idsToJoin.length);
      idsToJoin.forEach((id) => {
        socket.emit("join-conversation", { conversationId: id });
      });
    }
  },
}));

