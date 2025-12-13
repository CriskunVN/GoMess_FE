import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// tự thêm accessToken vào header của request sau khi đăng nhập
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// tự động refresh token khi nhận được phản hồi 401 từ server
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // lấy request gốc
    const originalRequest = error.config;
    // tránh các url không cần refresh
    if (
      originalRequest.url.includes(`/auth/refresh`) ||
      originalRequest.url.includes(`/auth/login`) ||
      originalRequest.url.includes(`/auth/register`)
    ) {
      return Promise.reject(error);
    }

    // biến đếm số lần refresh token
    originalRequest._retryCount = originalRequest._retryCount || 0;
    // Nếu nhận được lỗi 403 và chưa thử refresh quá 4 lần
    if (error.response?.status === 401 || error.response?.status === 403 && originalRequest._retryCount < 4) {
      console.log("refresh token count : ", originalRequest._retryCount);
      originalRequest._retryCount += 1;
      try {
        // refresh token và cập nhật lại accessToken trong store
        const newAccessToken = await api
          .post(`/auth/refresh`, {}, { withCredentials: true })
          .then((res) => res.data.accessToken);

        useAuthStore.getState().setAccessToken(newAccessToken);

        // Cập nhật header của request gốc với accessToken mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        useAuthStore.getState().clearState();
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);
export default api;
