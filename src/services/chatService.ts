import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

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
    // Sử dụng query params đúng chuẩn và tránh khoảng trắng/giá trị rỗng gây lặp dữ liệu
    // Khi cursor undefined: server sẽ trả trang đầu, còn khi null: client sẽ không gọi nữa
    const res = await api.get(`/conversations/${id}/messages`, {
      params: {
        limit: pageLimit,
        // Nếu cursor là chuỗi rỗng, gửi undefined để server hiểu là không có cursor
        cursor: cursor && cursor.length > 0 ? cursor : undefined,
      },
    });

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

  async createGroupConversation(name: string, memberIds: string[]) {
    
    const res = await api.post("/conversations/group", {
      name,
      memberIds,
    });
    return res.data.data; 
  },

  async fetchFriends() {
    const res = await api.get("/friends");
    return res.data.data; // trả về [{ _id, displayName, avatarUrl }]
  },

  async markAsRead(conversationId: string) {
    await api.put(`/conversations/${conversationId}/read`);
  },

  async searchUsers(query: string) {
    const res = await api.get("/users/search", {
      params: { q: query },
    });
    return res.data.data;
  },

  async sendFriendRequest(userId: string) {
    const res = await api.post("/friends/request", { userId });
    return res.data;
  },
};
