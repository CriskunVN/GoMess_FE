import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Users, MessageSquarePlus } from "lucide-react";
import AddFriendModal from "./AddFriendModal";
import NewGroupChatModal from "./NewGroupChatModal";

const CreateNewChatModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-40 justify-start gap-2 px-2 text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-6" />
          <span className="text-base">Tạo chat mới</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Tạo cuộc trò chuyện mới
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-2 gap-2">
            <AddFriendModal
              customTrigger={
                <Button
                  variant="outline"
                  className="h-24 w-full flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all"
                >
                  <MessageSquarePlus className="size-8 text-primary" />
                  <span>Nhắn tin riêng</span>
                </Button>
              }
            />
            <NewGroupChatModal
              customTrigger={
                <Button
                  variant="outline"
                  className="h-24 w-full flex flex-col gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all"
                >
                  <Users className="size-8 text-blue-500" />
                  <span>Tạo nhóm</span>
                </Button>
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default CreateNewChatModal;
