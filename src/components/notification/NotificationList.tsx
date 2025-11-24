"use client";


import { NotificationRow } from "./NotificationRow";
import { NotificationEmpty } from "./NotificationEmpty";
import { NotificationFooter } from "./NotificationFooter";
import { MappedNotification } from "./types";
import { Card } from "@/components/ui/card";

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

  return (
    <Card>
      {notifications.map((notification, index) => (
        <NotificationRow key={notification.id} notification={notification} onMarkAsRead={onMarkAsRead} isLast={index === notifications.length - 1} />
      ))}
      <NotificationFooter {...footerProps} />
    </Card>
  );
};