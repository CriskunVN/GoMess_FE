import Logout from "@/components/auth/Logout";
import { useAuthStore } from "@/stores/useAuthStore";
import React from "react";

const ChatAppPage = () => {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="flex items-center justify-center min-h-svh bg-gradient-green">
      <h1 className="text-4xl font-bold text-white">Chat Application</h1>
      <p className="text-lg text-white">
        Welcome to the Hood {!user || !user.username ? "Guest" : user.username}!
      </p>
      <Logout />
    </div>
  );
};

export default ChatAppPage;
