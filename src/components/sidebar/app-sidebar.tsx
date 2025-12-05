import * as React from "react";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Moon, Sun, Search } from "lucide-react";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import CreateNewChat from "../chat/CreateNewChatModal";
import GroupChatList from "../chat/GroupChatList";
import AddFriendModal from "../chat/AddFriendModal";
import DirectMessageList from "../chat/DirectChatList";
import { useThemeStore } from "@/stores/useThemeStore";
import { useAuthStore } from "@/stores/useAuthStore";
import NewGroupChatModal from "../chat/NewGroupChatModal";
import AddFriend from "../chat/AddFriend";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <Sidebar variant="inset" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="bg-gradient-to-r from-[#00c49f] to-[#006955] 
            hover:from-[#00a385] hover:to-[#004d40] 
            transition-all duration-300 ease-in-out"
            >
              <a href="#">
                <div className="flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">GoMess</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80" />
                    <Switch
                      checked={isDark}
                      onCheckedChange={toggleTheme}
                      className="data-[state=checked]:bg-background/80"
                    />
                    <Moon className="size-4 text-white/80" />
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
            <Input
              placeholder="Tìm kiếm bạn bè..."
              className="pl-10 h-10 bg-background border-border focus-visible:ring-1 focus-visible:ring-primary transition-all text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="beautiful-scrollbar">
        {/* New chat */}
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col lg:flex-row gap-2">
            <CreateNewChat className="flex-1" />
            <AddFriend className="flex-1" />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group Chat list  */}
        <SidebarGroup>
          {/* left */}
          <SidebarGroupLabel className="p-0 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Cộng đồng 8
          </SidebarGroupLabel>
          {/* right */}
          <SidebarGroupAction title="Tạo Nhóm" className="cursor-pointer">
            <NewGroupChatModal />
          </SidebarGroupAction>
          {/* Chat list here */}
          <SidebarGroupContent>
            <GroupChatList searchTerm={searchTerm} />
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Direct Message */}
        <SidebarGroup>
          {/* left */}
          <SidebarGroupLabel className="p-0 text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Gáy với bạn bè
          </SidebarGroupLabel>
          {/* right */}
          <SidebarGroupAction title="Kết Bạn" className="cursor-pointer">
            <AddFriendModal />
          </SidebarGroupAction>

          {/* Chat list here */}
          <SidebarGroupContent>
            <DirectMessageList searchTerm={searchTerm} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>{user && <NavUser user={user} />} </SidebarFooter>
    </Sidebar>
  );
}
