import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

export const chatService = {
  async fetchConversation(): Promise<ConversationResponse> {
    const res = await api.get("/api/v1/conversations");
    return res.data;
  },
};
