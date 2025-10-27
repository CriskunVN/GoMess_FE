import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { fi } from "zod/v4/locales";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

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
      if (res.status !== 200) {
        toast.error(res.data.message || "Đăng nhập thất bại!");
        return false;
      }
      set({ accessToken: res.data.accessToken });
      toast.success("Đăng nhập thành công!");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
      return false;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      // Gọi API đăng xuất ở đây
      get().clearState();
      await authService.signOut();
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Đăng xuất thất bại! Vui lòng thử lại.");
    }
  },
}));
