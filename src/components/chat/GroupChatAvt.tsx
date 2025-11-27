import type { Participant } from "@/types/chat";
import React from "react";
import UserAvt from "./UserAvt";
import { Ellipsis } from "lucide-react";

interface GroupChatAvtProps {
  participants: Participant[];
  type: "chat" | "sidebar";
}

const GroupChatAvt = ({ participants, type }: GroupChatAvtProps) => {
  const avt = [];
  const limit = Math.min(participants.length, 4);

  for (let i = 0; i < limit; i++) {
    const member = participants[i];
    avt.push(
      <UserAvt
        key={i}
        type={type}
        name={member.displayName}
        avtUrl={member.avatarUrl ?? undefined}
      />
    );
  }

  return (
    <div className="relative flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2">
      {avt}
      {/* member > 4 then render (...) */}
      {avt.length > limit && (
        <div
          className="flex items-center z-10 justify-center size-8 rounded-full
            bg-muted ring-2 ring-background text-muted-foreground"
        >
          <Ellipsis className="size-4" />
        </div>
      )}
    </div>
  );
};

export default GroupChatAvt;
