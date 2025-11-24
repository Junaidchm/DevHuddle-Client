"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/src/components/ui/button";

import { cn } from "@/src/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, UserPlus, MessageSquare, Heart, AtSign, Star, Briefcase, Calendar } from "lucide-react";
import { MappedNotification, NotificationType } from "./types";

const iconMap: Record<NotificationType, React.ReactNode> = {
  follow: <UserPlus className="w-4 h-4 text-primary" />,
  comment: <MessageSquare className="w-4 h-4 text-primary" />,
  like: <Heart className="w-4 h-4 text-primary" />,
  mention: <AtSign className="w-4 h-4 text-primary" />,
  collab: <Briefcase className="w-4 h-4 text-primary" />,
  event: <Calendar className="w-4 h-4 text-primary" />,
  message: <MessageSquare className="w-4 h-4 text-primary" />,
  support: <Star className="w-4 h-4 text-primary" />,
};

interface NotificationRowProps {
  notification: MappedNotification;
  onMarkAsRead: (id: string) => void;
  isLast: boolean;
}

export const NotificationRow = ({ notification, onMarkAsRead, isLast }: NotificationRowProps) => {
  return (
    <div className={cn("flex items-start gap-4 p-4 transition-colors hover:bg-muted/50", { "border-b": !isLast })}>
      {!notification.isRead && <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />}
      <div className={cn("flex-shrink-0", { "ml-4": notification.isRead })}>
        {iconMap[notification.type]}
      </div>
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={notification.avatarUrl} alt={notification.title} />
        <AvatarFallback>{notification.title.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{notification.title}</span> {notification.message}
        </p>
        <time className="text-xs text-muted-foreground">
          {formatDistanceToNow(notification.time, { addSuffix: true })}
        </time>
      </div>
      {!notification.isRead && (
        <Button size="sm" variant="ghost" onClick={() => onMarkAsRead(notification.id)}>
          Mark as read
        </Button>
      )}
    </div>
  );
};