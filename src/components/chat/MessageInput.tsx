import { useAuthStore } from "@/stores/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send, X, File, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";

// Supported file types
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ACCEPTED_FILE_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES, "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const [value, setValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendDirectMessage, sendGroupMessage } = useChatStore();
  
  if (!user) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error("Định dạng file không được hỗ trợ");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File quá lớn. Kích thước tối đa là 50MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images and videos
    if (ACCEPTED_IMAGE_TYPES.includes(file.type) || ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
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

  return (
    <div className="flex flex-col gap-2 p-3 min-h-[56px] bg-background">
      {/* File Preview */}
      {selectedFile && (
        <div className="relative inline-flex items-center gap-2 p-2 bg-muted rounded-lg max-w-xs">
          {previewUrl && ACCEPTED_IMAGE_TYPES.includes(selectedFile.type) ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-md"
            />
          ) : previewUrl && ACCEPTED_VIDEO_TYPES.includes(selectedFile.type) ? (
            <video
              src={previewUrl}
              className="w-16 h-16 object-cover rounded-md"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-md">
              <File className="size-6 text-primary" />
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
        {/* File Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={ACCEPTED_FILE_TYPES.join(",")}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 transition-smooth"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <ImagePlus className="size-4" />
        </Button>

        <div className="flex-1 relative">
          <Input
            onKeyPress={handleKeyPress}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Soạn tin nhắn..."
            className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
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
