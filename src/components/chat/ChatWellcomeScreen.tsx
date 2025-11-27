import { SidebarInset } from "../ui/sidebar";
import ChatWindownHeader from "./ChatWindowHeader";

const ChatWellcomeScreen = () => {
  return (
    <SidebarInset className="flex w-full h-full bg-transparent">
      <ChatWindownHeader />
      <div className="flex bg-gradient-bgChat rounded-2xl flex-1 items-center justify-center">
        <div className="text-center">
          <div className="size-30 mx-auto mb-6 bg-gradient-green-text rounded-full flex items-center justify-center shadow-glow pulse-ring">
            <span className="text-7xl">😶‍🌫️</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-green-text bg-clip-text text-transparent">
            {" "}
            Chào mừng bạn đến với GoMess
          </h2>
          <p className="text-emerald-50-foreground">
            Chọn 1 cuộc hội thoại để bắt đầu tám chuyện thoyy!
          </p>
        </div>
      </div>
    </SidebarInset>
  );
};

export default ChatWellcomeScreen;
