import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";
const apiVersion = "api/v1";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}
const pageLimit = 50;

export const chatService = {
  async fetchConversation(): Promise<ConversationResponse> {
    const res = await api.get(`/${apiVersion}/conversations`);
    return { conversations: res.data.data };
  },

  async fetchMessage(id: string, cursor?: string): Promise<FetchMessageProps> {
    const res = await api.get(
      `/conversations/${id}/messages/limit=${pageLimit}&cursor= ${cursor}`
    );

    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },
};
