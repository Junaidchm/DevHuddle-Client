"use client";

import { NotificationRow } from "./NotificationRow";
import { NotificationEmpty } from "./NotificationEmpty";
import { NotificationFooter } from "./NotificationFooter";
import { MappedNotification } from "./types";

interface NotificationListProps {
  notifications: MappedNotification[];
  onMarkAsRead: (id: string) => void;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
}

export const NotificationList = ({
  notifications,
  onMarkAsRead,
  ...footerProps
}: NotificationListProps) => {
  if (notifications.length === 0) {
    return <NotificationEmpty />;
  }

  // LinkedIn-style: separate cards, no grouping
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {notifications.map((notification, index) => (
        <NotificationRow 
          key={notification.id} 
          notification={notification} 
          onMarkAsRead={onMarkAsRead} 
          isLast={index === notifications.length - 1} 
        />
      ))}
      <NotificationFooter {...footerProps} />
    </div>
  );
};