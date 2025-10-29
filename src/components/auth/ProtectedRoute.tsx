import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import Loader from "../ui/Loader";

const ProtectedRoute = () => {
  const [starting, setStarting] = useState(true);
  let { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const init = async () => {
    try {
      // Nếu không có token, thử refresh từ cookie
      if (!accessToken) {
        await refresh();
        accessToken = useAuthStore.getState().accessToken;
      }
      // Nếu có token nhưng chưa có user, fetch user
      else if (!user) {
        await fetchMe();
      }
    } catch (error) {
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    init();
  }, []); // Chỉ chạy 1 lần khi mount

  if (starting || loading) {
    return <Loader />;
  }
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet></Outlet>;
};

export default ProtectedRoute;
