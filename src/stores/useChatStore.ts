import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import type { Message } from "@/types/chat";

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
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
            file
          );
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
          await chatService.sendGroupMessage(conversationId, content, imgUrl, file);
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
      addMessage: async (message: Message) => {
        try {
          const { user } = useAuthStore.getState();
          const { fetchMessages } = get();

          message.isOwn = message.senderId === user?._id;
          const convoId = message.conversationId;

          let prevItems = get().messages[convoId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(convoId);
            prevItems = get().messages[convoId]?.items ?? [];
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }

            // nếu tin nhắn là tin nhắn của cuộc trò chuyện hiện tại và không phải của mình thì đánh dấu đã đọc
            if (state.activeConversationId === convoId && !message.isOwn) {
              get().markConversationAsRead(convoId);
            }

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId]?.hasMore,
                  nextCursor: state.messages[convoId]?.nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("Lỗi khi thêm tin nhắn mới", error);
        }
      },
      updateConversation: (convo) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === convo._id ? { ...c, ...convo } : c
          ),
        }));
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
