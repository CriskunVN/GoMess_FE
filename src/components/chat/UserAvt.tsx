import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface IUserAvtProps {
  type: "sidebar" | "chat" | "profile";
  name: string;
  avtUrl?: string;
  className?: string;
}

const UserAvt = ({ type, name, avtUrl, className }: IUserAvtProps) => {
  const bgColor = !avtUrl ? "bg-blue-500" : "";
  if (!name) {
    name = "UserGM";
  }
  return (
    <Avatar
      className={cn(
        className ?? "",
        type === "sidebar" && "size-12 text-base",
        type === "chat" && "size-8 text-sm",
        type === "profile" && "size-24 text-3xl shadow-md"
      )}
    >
      <AvatarImage src={avtUrl} alt={name} />
      <AvatarFallback className={`${bgColor} text-white font-semibold`}>
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvt;
