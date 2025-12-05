import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { friendService } from "@/services/friendService";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
    username: string;
  };
  createdAt: string;
}

const FriendRequests = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await friendService.fetchFriendRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch friend requests", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await friendService.acceptFriendRequest(requestId);
      toast.success("Đã chấp nhận lời mời kết bạn");
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (error) {
      console.error("Failed to accept request", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await friendService.rejectFriendRequest(requestId);
      toast.success("Đã từ chối lời mời kết bạn");
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (error) {
      console.error("Failed to reject request", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Không có lời mời kết bạn nào
      </div>
    );
  }

  return (
    <div className="h-[300px] overflow-y-auto space-y-2">
      {requests.map((request) => (
        <div
          key={request._id}
          className="flex items-center justify-between p-2 rounded-lg border bg-card"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={request.sender.avatarUrl} />
              <AvatarFallback>
                {request.sender.displayName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{request.sender.displayName}</span>
              <span className="text-xs text-muted-foreground">
                @{request.sender.username}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={processing === request._id}
              onClick={() => handleReject(request._id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
              disabled={processing === request._id}
              onClick={() => handleAccept(request._id)}
            >
              {processing === request._id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
