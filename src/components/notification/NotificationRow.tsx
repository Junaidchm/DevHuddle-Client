"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { 
  MoreHorizontal, 
  Trash2,
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
  Bell,
  AlertTriangle
} from "lucide-react";
import { MappedNotification, NotificationType } from "./types";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useToast } from "@/src/components/ui/use-toast";
import { ToastAction } from "@/src/components/ui/toast";
import { useDeleteNotification, useRestoreNotification } from "@/src/customHooks/useNotifications";

// LinkedIn-style icon mapping with proper colors
const getNotificationIcon = (type: NotificationType): React.ReactNode => {
  const iconClass = "w-5 h-5";
  const iconColor = "text-primary";
  
  switch (type) {
    case "like":
      return <Heart className={cn(iconClass, "text-red-500")} fill="currentColor" />;
    case "comment":
      return <MessageSquare className={cn(iconClass, "text-green-600")} />;
    case "reply":
      return <Reply className={cn(iconClass, "text-green-600")} />;
    case "mention":
      return <AtSign className={cn(iconClass, "text-orange-500")} />;
    case "follow":
      return <UserPlus className={cn(iconClass, "text-blue-500")} />;
    case "share":
      return <Share2 className={cn(iconClass, "text-purple-600")} />;
    case "live":
      return <Radio className={cn(iconClass, "text-red-600")} fill="currentColor" />;
    case "message":
      return <MessageSquare className={cn(iconClass, "text-blue-500")} />;
    case "collab":
      return <Briefcase className={cn(iconClass, "text-indigo-600")} />;
    case "event":
      return <Calendar className={cn(iconClass, "text-yellow-600")} />;
    case "system":
      return <Bell className={cn(iconClass, "text-gray-500")} />;
    case "support":
      return <Star className={cn(iconClass, "text-yellow-500")} />;
    case "report":
      return <AlertTriangle className={cn(iconClass, "text-red-500")} />;
    case "hub_join_request":
      return <UserPlus className={cn(iconClass, "text-indigo-500")} />;
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
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: deleteNotification } = useDeleteNotification();
  const { mutate: restoreNotification } = useRestoreNotification();

  const actorNames = formatActorNames(
    notification.actors, 
    notification.aggregatedCount || notification.actors.length,
    notification.title
  );
  const timeAgo = formatDistanceToNow(notification.time, { addSuffix: true });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 1. Trigger Delete Mutation
    deleteNotification(notification.id);

    // 2. Show Toast with Undo
    toast({
      title: "Notification deleted",
      description: "Item removed from your list",
      action: (
        <ToastAction 
          altText="Undo delete" 
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            restoreNotification({ notificationId: notification.id, notification });
          }}
        >
          Undo
        </ToastAction>
      ),
      duration: 5000,
    });
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Redirection Logic
    switch (notification.type) {
      case "follow": {
        const primaryActor = notification.actors[0];
        // Navigate to profile using username if available, fallback to ID
        const profileIdentifier = primaryActor?.username || primaryActor?.id;
        if (profileIdentifier) {
          router.push(`/profile/${profileIdentifier}`);
        }
        break;
      }
      case "message":
        router.push("/chat");
        break;
      case "system":
        // System notifications could have a target route in metadata
        // Fallback to home if no specific route provided
        router.push("/");
        break;
      case "hub_join_request":
        if (notification.entityId) {
          router.push(`/chat?id=${notification.entityId}`);
        }
        break;
      case "like":
      case "comment":
      case "reply":
      case "mention":
      case "share":
      case "report":
      default:
        if (notification.projectId) {
          // Navigate to project detail page
          const query = notification.commentId ? `?commentId=${notification.commentId}` : "";
          router.push(`/projects/${notification.projectId}${query}`);
        } else if (notification.postId) {
          // Navigate to post detail page with commentId highlight if exists
          const query = notification.commentId ? `?commentId=${notification.commentId}` : "";
          router.push(`/post/${notification.postId}${query}`);
        } else if (notification.type === "support" || notification.type === "event") {
          // Add other specific routes as needed
          router.push("/");
        }
        break;
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer relative group",
        { "border-b border-border": !isLast },
        { "bg-primary/5": !notification.isRead }
      )}
      onClick={handleClick}
    >
      {/* Unread indicator - blue dot on the left */}
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}

      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Profile Picture */}
      <Avatar className="w-12 h-12 flex-shrink-0 border border-border">
        <AvatarImage src={notification.avatarUrl || PROFILE_DEFAULT_URL} alt={actorNames} />
        <AvatarFallback className="bg-muted text-muted-foreground">
          {actorNames.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm text-foreground leading-5">
              <span className="font-semibold hover:underline">{actorNames}</span>
              {" "}
              <span className="text-muted-foreground">{notification.actionText}</span>
            </p>
            
            {/* Preview for posts/comments */}
            {notification.preview && (
              <div className="mt-2 p-3 bg-muted/40 rounded-lg border border-border">
                {notification.preview.imageUrl && (
                  <img 
                    src={notification.preview.imageUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.preview.content}
                </p>
              </div>
            )}

            <time className="text-xs text-muted-foreground mt-1 block">
              {timeAgo}
            </time>
          </div>

          {/* Three-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 flex-shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-500 focus:text-red-500 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete notification
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};