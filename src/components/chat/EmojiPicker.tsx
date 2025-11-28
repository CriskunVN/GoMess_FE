import { useThemeStore } from "@/stores/useThemeStore";
import React from "react";
import { Popover, PopoverContent } from "../ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore();
  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <Smile className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="relative w-32 h-32 rounded-full
    
    /* 1. Nền trong suốt hơi xanh nhẹ */
    bg-blue-100/10 
    
    /* 2. Làm mờ hậu cảnh (hiệu ứng kính) */
    backdrop-blur-sm
    
    /* 3. Tạo viền sáng ở trên và trái (giả ánh sáng chiếu vào) */
    border-t border-l border-white/60
    border-b border-r border-white/20
    
    /* 4. Đổ bóng (Shadow) */
    /* Shadow ngoài để tách biệt khỏi nền */
    shadow-xl 
    
    /* QUAN TRỌNG: Shadow trong (inset) để tạo cảm giác 3D phồng lên */
    shadow-[inset_10px_10px_20px_rgba(255,255,255,0.2),inset_-10px_-10px_20px_rgba(0,0,0,0.1)]
    
    flex items-center justify-center border-none shadow-none drop-shadow-none mb-12"
      >
        <Picker
          theme={isDark ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native)}
          emojiSize={24}
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
