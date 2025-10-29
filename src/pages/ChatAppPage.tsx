import Logout from "@/components/auth/Logout";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect } from "react";
import { toast } from "sonner";
import { ca } from "zod/v4/locales";

const ChatAppPage = () => {
  const { user, accessToken } = useAuthStore();
  useEffect(() => {
    console.log("ChatAppPage mounted");
  }, []);

  const handleTest = async () => {
    try {
      const res = await api.get("/api/v1/auth/test", { withCredentials: true });
      toast.success(res.data.message);
    } catch (error) {
      console.error("Test auth failed:", error);
      toast.error("Test auth failed!");
    }
  };
  return (
    <>
      <h1>Chat App Page</h1>
      <p>User: {!user ? "No user found" : user.username}</p>
      <p>Access Token: {accessToken || "No Access Token"}</p>
      <Logout />
      <Button onClick={handleTest}>Test Auth</Button>
    </>
  );
};

export default ChatAppPage;
