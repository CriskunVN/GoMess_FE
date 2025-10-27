import Logout from "@/components/auth/Logout";
import React from "react";

const ChatAppPage = () => {
  return (
    <div className="flex items-center justify-center min-h-svh bg-gradient-green">
      <h1 className="text-4xl font-bold text-white">Chat Application</h1>
      <p className="text-lg text-white">Welcome to the chat application!</p>
      <Logout />
    </div>
  );
};

export default ChatAppPage;
