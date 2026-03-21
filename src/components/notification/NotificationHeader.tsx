"use client";

import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  isMarkingAllAsRead: boolean;
  isClearingAll: boolean;
  hasNotifications: boolean;
}

export const NotificationHeader = ({
  unreadCount,
  onMarkAllAsRead,
  onClearAll,
  isMarkingAllAsRead,
  isClearingAll,
  hasNotifications,
}: NotificationHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Bell className="w-6 h-6" />
        Notifications
        {unreadCount > 0 && (
          <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </h1>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onMarkAllAsRead} 
          disabled={isMarkingAllAsRead || unreadCount === 0}
        >
          <Bell className="w-4 h-4 mr-2" />
          Mark all as read
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearAll} 
          disabled={isClearingAll || !hasNotifications}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear all
        </Button>
      </div>
    </div>
  );
};