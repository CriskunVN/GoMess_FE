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
    const res = await api.post("/friends/requests", { to: userId });
    return res.data; // trả về { requestId }
  },

  async fetchFriendRequests() {
    const res = await api.get("/friends/requests");
    return res.data; // trả về [{ requestId, from { _id, displayName, avatarUrl }, createdAt }]
  },
  

  async acceptFriendRequest(requestId: string) {
    const res = await api.post(`/friends/requests/${requestId}/accept`);
    return res.data; // trả về { requestId }
  },

  async rejectFriendRequest(requestId: string) {
    const res = await api.post(`/friends/requests/${requestId}/reject`);
    return res.data; // trả về { requestId }
  },
};