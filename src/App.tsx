import { BrowserRouter, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ChatAppPage from "./pages/ChatAppPage";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useThemeStore } from "./stores/useThemeStore";
import { useEffect } from "react";
import { useAuthStore } from "./stores/useAuthStore";
import { useSocketStore } from "./stores/useSocketStore";
function App() {
  const { isDark, setTheme } = useThemeStore();
  const { accessToken } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    // Khôi phục theme từ localStorage khi ứng dụng khởi động
    setTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    if (accessToken) {
      connectSocket();
    }

    return () => disconnectSocket();
  }, [accessToken]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("Network is online, sending pending messages...");
      import("./stores/useChatStore").then(({ useChatStore }) => {
        useChatStore.getState().sendPendingMessages();
      });
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* { Public routes} */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignupPage />} />

          {/* { Private routes} */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatAppPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
