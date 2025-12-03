import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import type { Message } from "@/types/chat";
import { UndoIcon } from "lucide-react";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      convoLoading: false,
      messageLoading: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),
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

      sendDirectMessage: async (recipientId, content, imgUrl = "") => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined
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
      sendGroupMessage: async (conversationId, content, imgUrl = "") => {
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl);
          console.log("đã gửi tin nhắn group");
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi khi send message group", error);
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
    }),

    {
      name: "chat-storage",
      partialize: (state) => ({
        conversations: state.conversations,
      }),
    }
  )
);
