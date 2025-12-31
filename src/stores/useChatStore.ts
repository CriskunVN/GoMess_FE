import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import type { Message } from "@/types/chat";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false,
      messageLoading: false,
      pendingMessages: [],

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
        if (id) {
          get().markConversationAsRead(id);
        }
      },
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: false,
          messageLoading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });
          const { conversations } = await chatService.fetchConversation();
          console.log("conversation : ", conversations);
          // Khử trùng lặp cuộc trò chuyện theo _id nếu backend trả trùng
          const uniqueConversations = Array.from(
            new Map(conversations.map((c) => [c._id, c])).values()
          );

          set({ conversations: uniqueConversations, convoLoading: false });
          
          // Join socket rooms for all fetched conversations
          const conversationIds = uniqueConversations.map(c => c._id);
          useSocketStore.getState().joinConversationRooms(conversationIds);
        } catch (error) {
          console.error("Lỗi khi fetchConversation", error);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();
        const convoId = conversationId ?? activeConversationId;

        if (!convoId) return;

        const current = messages?.[convoId];
        // Không dùng chuỗi rỗng cho cursor. undefined => trang đầu; null => không còn trang
        const nextCursor = current?.nextCursor;

        if (nextCursor === null) return;

        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessage(
            convoId,
            nextCursor
          );

          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));

          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const combined =
              prev.length > 0 ? [...processed, ...prev] : processed;
            // Khử trùng lặp theo _id để tránh trùng tin nhắn khi server trả trùng trang
            const seen = new Set<string>();
            const merged = combined.filter((m) => {
              if (!m._id) return true;
              if (seen.has(m._id)) return false;
              seen.add(m._id);
              return true;
            });

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi xảy ra khi fetch messages", error);
        } finally {
          set({ messageLoading: false });
        }
      },

      sendDirectMessage: async (recipientId, content, imgUrl = "", file?: File) => {
        const { activeConversationId, addMessage } = get();
        const { user } = useAuthStore.getState();

        if (!navigator.onLine && !file) {
          const tempId = `temp-${Date.now()}`;
          const tempMessage: Message = {
            _id: tempId,
            conversationId: activeConversationId || "",
            senderId: user?._id || "",
            content,
            imgUrl,
            createdAt: new Date().toISOString(),
            isOwn: true,
            isPending: true,
          };
          
          set((state) => ({
            pendingMessages: [...state.pendingMessages, { ...tempMessage, recipientId } as any],
          }));
          addMessage(tempMessage);
          return;
        }

        try {
          const response = await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
            file
          );
          
          console.log("[DEBUG] sendDirectMessage response:", response);
          
          // Handle response - could be array, single object, or nested
          let messageData = response;
          if (Array.isArray(response)) {
            messageData = response[0]; // Get first message if array
          } else if (response?.message) {
            messageData = response.message; // If nested under 'message' key
          }
          
          // Add the sent message to UI immediately for the sender
          if (messageData && messageData._id) {
            const sentMessage: Message = {
              _id: messageData._id,
              content: messageData.content || content,
              conversationId: messageData.conversationId || activeConversationId || "",
              senderId: messageData.senderId || user?._id || "",
              createdAt: messageData.createdAt || new Date().toISOString(),
              messageType: messageData.messageType || "text",
              fileUrl: messageData.fileUrl,
              fileInfo: messageData.fileInfo,
              isOwn: true,
            };
            console.log("[DEBUG] Adding sent message to UI:", sentMessage);
            addMessage(sentMessage);
          } else {
            console.warn("[DEBUG] No valid message in response, response was:", response);
          }
          
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi khi gửi direct message", error);
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl = "", file?: File) => {
        const { addMessage } = get();
        const { user } = useAuthStore.getState();

        if (!navigator.onLine && !file) {
           const tempId = `temp-${Date.now()}`;
           const tempMessage: Message = {
            _id: tempId,
            conversationId,
            senderId: user?._id || "",
            content,
            imgUrl,
            createdAt: new Date().toISOString(),
            isOwn: true,
            isPending: true,
          };

          set((state) => ({
            pendingMessages: [...state.pendingMessages, { ...tempMessage, isGroup: true } as any],
          }));
          addMessage(tempMessage);
          return;
        }

        try {
          const response = await chatService.sendGroupMessage(conversationId, content, imgUrl, file);
          
          console.log("[DEBUG] sendGroupMessage response:", response);
          
          // Handle response - could be array, single object, or nested
          let messageData = response;
          if (Array.isArray(response)) {
            messageData = response[0]; // Get first message if array
          } else if (response?.message) {
            messageData = response.message; // If nested under 'message' key
          }
          
          // Add the sent message to UI immediately for the sender
          if (messageData && messageData._id) {
            const sentMessage: Message = {
              _id: messageData._id,
              content: messageData.content || content,
              conversationId: messageData.conversationId || conversationId,
              senderId: messageData.senderId || user?._id || "",
              createdAt: messageData.createdAt || new Date().toISOString(),
              messageType: messageData.messageType || "text",
              fileUrl: messageData.fileUrl,
              fileInfo: messageData.fileInfo,
              isOwn: true,
            };
            console.log("[DEBUG] Adding sent message to UI:", sentMessage);
            addMessage(sentMessage);
          } else {
            console.warn("[DEBUG] No valid message in response, response was:", response);
          }
          
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi khi send message group", error);
        }
      },
      sendPendingMessages: async () => {
        const { pendingMessages, sendDirectMessage, sendGroupMessage } = get();
        if (pendingMessages.length === 0) return;

        const messagesToSend = [...pendingMessages];
        set({ pendingMessages: [] }); // xóa tin nhắn trong hàng đợi

        for (const msg of messagesToSend) {
          // xóa tin nhắn trong UI để tránh trùng khi re-add hoặc fetch
           set((state) => {
             const convoId = msg.conversationId;
             const currentMessages = state.messages[convoId]?.items || [];
             return {
               messages: {
                 ...state.messages,
                 [convoId]: {
                   ...state.messages[convoId],
                   items: currentMessages.filter(m => m._id !== msg._id)
                 }
               }
             }
           });

          if ((msg as any).isGroup) {
            await sendGroupMessage(msg.conversationId, msg.content || "", msg.imgUrl || undefined);
          } else {
            await sendDirectMessage((msg as any).recipientId, msg.content || "", msg.imgUrl || undefined);
          }
        }
      },
      addMessage: (message: Message) => {
        const { user } = useAuthStore.getState();
        
        console.log("[DEBUG] addMessage called with:", {
          messageId: message._id,
          conversationId: message.conversationId,
          content: message.content?.substring(0, 50),
          senderId: message.senderId,
        });

        const convoId = message.conversationId;
        const enrichedMessage = {
          ...message,
          isOwn: message.senderId === user?._id,
        };

        set((state) => {
          const prevItems = state.messages[convoId]?.items ?? [];
          
          // Check for duplicate
          if (prevItems.some((m) => m._id === message._id)) {
            console.log("[DEBUG] Duplicate message detected, skipping");
            return state;
          }

          console.log("[DEBUG] Adding message to state, prev count:", prevItems.length);

          // Mark as read if active conversation and not own message
          if (state.activeConversationId === convoId && !enrichedMessage.isOwn) {
            setTimeout(() => get().markConversationAsRead(convoId), 0);
          }

          return {
            messages: {
              ...state.messages,
              [convoId]: {
                items: [...prevItems, enrichedMessage],
                hasMore: state.messages[convoId]?.hasMore ?? true,
                nextCursor: state.messages[convoId]?.nextCursor ?? undefined,
              },
            },
          };
        });
        
        console.log("[DEBUG] addMessage completed, new count:", get().messages[convoId]?.items?.length);
      },
      updateConversation: (convo) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === convo._id ? { ...c, ...convo } : c
          ),
        }));
      },
      addConversation: (conversation) => {
        set((state) => {
          // Kiểm tra trùng lặp
          if (state.conversations.some((c) => c._id === conversation._id)) {
            return state;
          }
          return {
            conversations: [conversation, ...state.conversations],
          };
        });
      },
      markConversationAsRead: async (conversationId: string) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        // cập nhật UI ngay khi nhận được tin nhắn
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c._id === conversationId) {
              return {
                ...c,
                unreadCounts: {
                  ...c.unreadCounts,
                  [user._id]: 0,
                },
              };
            }
            return c;
          }),
        }));

        try {
          await chatService.markAsRead(conversationId);
        } catch (error) {
          console.error("Lỗi khi đánh dấu đã đọc", error);
        }
      },
    }),

    {
      name: "chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        pendingMessages: state.pendingMessages,
      }),
    }
  )
);
