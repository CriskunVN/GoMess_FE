import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
      },
      setAccessToken: (accessToken: string) => {
        set({ accessToken });
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
          const { accessToken } = await authService.login(username, password);

          // Lưu accessToken vào state
          get().setAccessToken(accessToken);

          // Lấy thông tin user
          await get().fetchMe();
          toast.success("Chào mừng bạn đã đến với thế giới GoMess!🎉");
        } catch (error) {
          console.error(error);
          toast.error("Đăng nhập không thành công!");
        } finally {
          set({ loading: false });
        }
      },
      signOut: async () => {
        try {
          // Gọi API đăng xuất ở đây
          await authService.signOut();

          get().clearState();

          toast.success("Đăng xuất thành công!");
        } catch (error) {
          console.error(error);
          toast.error("Đăng xuất thất bại! Vui lòng thử lại.");
        }
      },
      fetchMe: async () => {
        try {
          set({ loading: true });
          const user = await authService.fetchMe();
          set({ user });
        } catch (error: any) {
          console.error("Lỗi khi lấy dữ liệu user : ", error);

          // Nếu lỗi 401/403, có thể token đã hết hạn
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            set({ user: null, accessToken: null });
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          } else {
            toast.error("Lỗi khi lấy thông tin người dùng.");
          }
        } finally {
          set({ loading: false });
        }
      },
      refresh: async () => {
        try {
          set({ loading: true });
          const { user, fetchMe, setAccessToken } = get();
          const accessToken = await authService.refresh();
          setAccessToken(accessToken);

          if (!user) {
            await fetchMe();
          }
        } catch (error: any) {
          console.error("Lỗi khi làm mới access token: ", error);

          console.error(error);
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
          get().clearState();
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ accessToken: state.accessToken }),
    }
  )
);
