import ChatWindownLayout from "@/components/chat/ChatWindownLayout";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
const ChatAppPage = () => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="flex h-screen w-full p-2">
        {/* Main chat application content goes here */}
        <ChatWindownLayout />
      </div>
    </SidebarProvider>
  );
};

export default ChatAppPage;
