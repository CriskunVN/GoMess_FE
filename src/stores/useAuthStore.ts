import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });
      // Gọi API đăng ký ở đây

      const displayName: string = firstName + " " + lastName;
      await authService.signUp(username, password, email, displayName);

      toast.success(
        "Đăng ký thành công! Bạn sẽ được chuyển sang trang đăng nhập."
      );
    } catch (error) {
      console.error(error);
      toast.error("Đăng ký thất bại! Vui lòng thử lại.");
    } finally {
      set({ loading: false });
    }
  },

  login: async (username, password) => {
    try {
      set({ loading: true });
      // Gọi API đăng nhập ở đây
      const res = await authService.login(username, password);
      set({ accessToken: res.data.accessToken, user: res.data.user });

      toast.success("Đăng nhập thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    }
  },
}));
