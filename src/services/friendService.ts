import api from "@/lib/axios";

export const friendService = {
    
    async fetchFriends() {
    const res = await api.get("/friends");
    return res.data.friends; // trả về [{ _id, displayName, avatarUrl }]
  },
  async searchUsers(query: string) {
    const res = await api.get("/users/search", {
      params: { q: query },
    });
    return res.data.data.users; // trả về [{ _id, displayName, avatarUrl }]
  },

  async sendFriendRequest(userId: string) {
    const res = await api.post("/friends/request", { userId });
    return res.data; // trả về { requestId }
  },

  async fetchFriendRequests() {
    const res = await api.get("/friends/requests");
    return res.data.data; // trả về [{ requestId, senderId, createdAt }]
  },

  async acceptFriendRequest(requestId: string) {
    const res = await api.post("/friends/accept", { requestId });
    return res.data; // trả về { requestId }
  },

  async rejectFriendRequest(requestId: string) {
    const res = await api.post("/friends/reject", { requestId });
    return res.data; // trả về { requestId }
  },
};