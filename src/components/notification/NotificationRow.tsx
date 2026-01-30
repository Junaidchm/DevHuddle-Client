"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { 
  MoreHorizontal, 
  UserPlus, 
  MessageSquare, 
  Heart, 
  AtSign, 
  Star, 
  Briefcase, 
  Calendar,
  Reply,
  Share2,
  Radio,
  Bell
} from "lucide-react";
import { MappedNotification, NotificationType } from "./types";
import { PROFILE_DEFAULT_URL } from "@/src/constents";

// LinkedIn-style icon mapping with proper colors
const getNotificationIcon = (type: NotificationType): React.ReactNode => {
  const iconClass = "w-5 h-5";
  const iconColor = "text-blue-600";
  
  switch (type) {
    case "like":
      return <Heart className={cn(iconClass, iconColor)} fill="currentColor" />;
    case "comment":
      return <MessageSquare className={cn(iconClass, iconColor)} />;
    case "reply":
      return <Reply className={cn(iconClass, iconColor)} />;
    case "mention":
      return <AtSign className={cn(iconClass, iconColor)} />;
    case "follow":
      return <UserPlus className={cn(iconClass, iconColor)} />;
    case "share":
      return <Share2 className={cn(iconClass, iconColor)} />;
    case "live":
      return <Radio className={cn(iconClass, "text-red-600")} fill="currentColor" />;
    case "message":
      return <MessageSquare className={cn(iconClass, iconColor)} />;
    case "collab":
      return <Briefcase className={cn(iconClass, iconColor)} />;
    case "event":
      return <Calendar className={cn(iconClass, iconColor)} />;
    case "system":
      return <Bell className={cn(iconClass, iconColor)} />;
    case "support":
      return <Star className={cn(iconClass, iconColor)} />;
    default:
      return <Bell className={cn(iconClass, iconColor)} />;
  }
};

// Format actor names for display (LinkedIn-style)
const formatActorNames = (actors: MappedNotification["actors"], count: number = 0, title?: string): string => {
  // If we have a pre-formatted title, use it
  if (title && title !== "Someone") {
    return title;
  }
  
  if (actors.length === 0) return "Someone";
  
  const names = actors
    .map(a => a.name)
    .filter(name => name && name !== "Someone" && name.trim().length > 0);
  
  if (names.length === 0) return "Someone";
  
  const actualCount = count || actors.length;
  
  if (actualCount === 0 || actualCount === 1) {
    return names[0] || "Someone";
  } else if (actualCount === 2 && names.length >= 2) {
    return `${names[0]} and ${names[1]}`;
  } else if (actualCount > 2) {
    return `${names[0]} and ${actualCount - 1} others`;
  }
  
  return names[0] || "Someone";
};

interface NotificationRowProps {
  notification: MappedNotification;
  onMarkAsRead: (id: string) => void;
  isLast: boolean;
}

export const NotificationRow = ({ notification, onMarkAsRead, isLast }: NotificationRowProps) => {
  const actorNames = formatActorNames(
    notification.actors, 
    notification.aggregatedCount || notification.actors.length,
    notification.title
  );
  const timeAgo = formatDistanceToNow(notification.time, { addSuffix: true });

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 cursor-pointer relative",
        { "border-b border-gray-200": !isLast },
        { "bg-blue-50/30": !notification.isRead }
      )}
      onClick={() => {
        if (!notification.isRead) {
          onMarkAsRead(notification.id);
        }
      }}
    >
      {/* Unread indicator - blue dot on the left */}
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
      )}

      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Profile Picture */}
      <Avatar className="w-12 h-12 flex-shrink-0 border border-gray-200">
        <AvatarImage src={notification.avatarUrl || PROFILE_DEFAULT_URL} alt={actorNames} />
        <AvatarFallback className="bg-gray-100 text-gray-600">
          {actorNames.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm text-gray-900 leading-5">
              <span className="font-semibold hover:underline">{actorNames}</span>
              {" "}
              <span className="text-gray-600">{notification.actionText}</span>
            </p>
            
            {/* Preview for posts/comments */}
            {notification.preview && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {notification.preview.imageUrl && (
                  <img 
                    src={notification.preview.imageUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <p className="text-sm text-gray-700 line-clamp-2">
                  {notification.preview.content}
                </p>
              </div>
            )}

            <time className="text-xs text-gray-500 mt-1 block">
              {timeAgo}
            </time>
          </div>

          {/* Three-dot menu */}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add dropdown menu for more options
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};