import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

const ProtectedRoute = () => {
  const [starting, setStarting] = useState(true);
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const init = async () => {
    // Nếu có token từ persist → chỉ cần fetchMe()
    if (accessToken && !user) {
      await fetchMe();
    }
    // Nếu không có token → mới gọi refresh()
    else if (!accessToken) {
      await refresh();
    }

    setStarting(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loader"></span>
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
