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
    const res = await api.get(`/conversations`);
    return { conversations: res.data.data };
  },

  async fetchMessage(id: string, cursor?: string): Promise<FetchMessageProps> {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}&cursor= ${
        cursor ?? "0"
      }`
    );

    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },

  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    imgUrl: string,
    conversationId?: string
  ) {
    const res = await api.post(`/messages/direct`, {
      recipientId,
      content,
      imgUrl,
      conversationId,
    });
    return res.data.messages;
  },

  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    imgUrl?: string
  ) {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
    });
    return res.data.messages;
  },
};
