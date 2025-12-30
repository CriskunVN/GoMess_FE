import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send, X, Loader2, Video, FileUp, Paperclip } from "lucide-react";

import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";


// File type configurations
const FILE_TYPES = {
  image: {
    accept: "image/jpeg,image/png,image/gif,image/webp",
    label: "Ảnh",
    icon: ImagePlus,
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  video: {
    accept: "video/mp4,video/webm,video/quicktime",
    label: "Video",
    icon: Video,
    maxSize: 50 * 1024 * 1024, // 50MB
  },
  file: {
    accept: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar",
    label: "File",
    icon: FileUp,
    maxSize: 25 * 1024 * 1024, // 25MB
  },
};

type FileType = keyof typeof FILE_TYPES;



const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFileTypeRef = useRef<FileType>("image");
  const { sendDirectMessage, sendGroupMessage } = useChatStore();

  if (!user) return null;

  const handleFileTypeSelect = (type: FileType) => {
    currentFileTypeRef.current = type;
    setPopoverOpen(false);
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.accept = FILE_TYPES[type].accept;
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    const fileType = currentFileTypeRef.current;
    const config = FILE_TYPES[fileType];

    // Validate file size
    if (file.size > config.maxSize) {
      toast.error(`File quá lớn. Kích thước tối đa cho ${config.label} là ${config.maxSize / 1024 / 1024}MB`);
      return;
    }

    setSelectedFile(file);

    // Create preview for images and videos

    if (fileType === "image" || fileType === "video") {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }


    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFilePreviewType = (): FileType => {
    if (!selectedFile) return "file";
    if (selectedFile.type.startsWith("image/")) return "image";
    if (selectedFile.type.startsWith("video/")) return "video";
    return "file";
  };

  const sendMessage = async () => {
    const currValue = value;
    const currFile = selectedFile;

    setValue("");
    clearSelectedFile();

    if (!currValue.trim() && !currFile) return;

    try {
      setIsUploading(!!currFile);

      if (selectedConvo.type === "direct") {
        const participants = selectedConvo.participants;
        const otherUser = participants.filter((p) => p._id !== user._id)[0];
        await sendDirectMessage(otherUser._id, currValue, undefined, currFile || undefined);
      } else {
        await sendGroupMessage(selectedConvo._id, currValue, undefined, currFile || undefined);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi xảy ra khi gửi tin nhắn, vui lòng thử lại");
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const previewType = getFilePreviewType();
  const PreviewIcon = FILE_TYPES[previewType].icon;

  return (
    <div className="flex flex-col gap-2 p-3 min-h-[56px] bg-background">
      {/* File Preview */}
      {selectedFile && (
        <div className="relative inline-flex items-center gap-2 p-2 bg-muted rounded-lg max-w-xs">

          {previewUrl && previewType === "image" ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-md"
            />

          ) : previewUrl && previewType === "video" ? (
            <video
              src={previewUrl}
              className="w-16 h-16 object-cover rounded-md"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-md">

              <PreviewIcon className="size-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 size-6 bg-destructive hover:bg-destructive/80 rounded-full"
            onClick={clearSelectedFile}
          >
            <X className="size-3 text-white" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}

          className="hidden"
        />

        {/* File Type Selector Popover */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 transition-smooth"
              disabled={isUploading}
            >
              <Paperclip className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-1" align="start">
            <div className="flex flex-col gap-1">
              {(Object.keys(FILE_TYPES) as FileType[]).map((type) => {
                const config = FILE_TYPES[type];
                const Icon = config.icon;
                return (
                  <Button
                    key={type}
                    variant="ghost"
                    className="justify-start gap-2 w-full"
                    onClick={() => handleFileTypeSelect(type)}
                  >
                    <Icon className="size-4" />
                    <span>{config.label}</span>
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1 relative">
          <Input
            onKeyPress={handleKeyPress}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Soạn tin nhắn..."

            className="pr-12 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
            disabled={isUploading}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-primary/10 transition-smooth"
            >
              <div>
                <EmojiPicker onChange={(e: string) => setValue(`${value}${e}`)} />
              </div>
            </Button>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={sendMessage}
          className="bg-gradient-bgChat hover:shadow-glow transition-smooth hover:scale-105"
          disabled={(!value.trim() && !selectedFile) || isUploading}
        >
          {isUploading ? (
            <Loader2 className="size-4 text-white animate-spin" />
          ) : (
            <Send className="size-4 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
