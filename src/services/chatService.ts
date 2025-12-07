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
    imgUrl?: string,
    conversationId?: string,
    file?: File
  ) {
    // If file is provided, send as FormData
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("recipientId", recipientId);
      formData.append("content", content);
      if (conversationId) {
        formData.append("conversationId", conversationId);
      }

      const res = await api.post("/messages/direct", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.messages;
    }

    // Otherwise send as JSON
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
    imgUrl?: string,
    file?: File
  ) {
    // If file is provided, send as FormData
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", conversationId);
      formData.append("content", content);

      const res = await api.post("/messages/group", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.messages;
    }

    // Otherwise send as JSON
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
    });
    return res.data.messages;
  },

  async createGroupConversation(name: string, memberIds: string[]) {
    
    const res = await api.post("/conversations", {
      type: "group",
      name,
      memberIds,
    });
    return res.data.data; 
  },
  // dùng để đánh dấu tin nhắn đã đọc
  async markAsRead(conversationId: string) {
    await api.put(`/conversations/${conversationId}/read`);
  },
};

