"use client";

import {
  useNotificationsInfinite,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/src/customHooks/useNotifications";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useMemo, useState, useCallback } from "react";
import {
  NotificationHeader,
  NotificationFilters,
  NotificationList,
  NotificationListSkeleton,
  SettingsSheet,
} from "@/src/components/notification";
import { MappedNotification, NotificationType } from "@/src/components/notification/types";
import { PROFILE_DEFAULT_URL } from "@/src/constents";

const NOTIFICATION_TYPE_MAP: Record<string, NotificationType> = {
  FOLLOW: "follow",
  MENTION: "mention",
  COMMENT: "comment",
  LIKE: "like",
  COLLAB: "collab",
  EVENT: "event",
  MESSAGE: "message",
  SUPPORT: "support",
};

export default function NotificationsClient() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationType | "all">("all");

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotificationsInfinite();

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.unreadCount || 0;

  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const flatNotifications = useMemo(
    () => (data?.pages ?? []).flatMap((p) => p.notifications),
    [data]
  );

  const mappedNotifications: MappedNotification[] = useMemo(() => {
    return flatNotifications.map((n) => ({
      id: n.id,
      type: NOTIFICATION_TYPE_MAP[n.type] || "support",
      isRead: !!n.readAt || !!n.read,
      avatarUrl: n.summary?.actors?.[0]?.profilePicture || PROFILE_DEFAULT_URL,
      title: (n.summary?.actors || []).map(a  => a.name).join(", ") || "System Notification",
      time: new Date(n.createdAt),
      message: n.summary?.text || "New notification",
    }));
  }, [flatNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return mappedNotifications;
    return mappedNotifications.filter((n) => n.type === activeFilter);
  }, [mappedNotifications, activeFilter]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!userId || unreadCount === 0) return;
    await markAllAsReadMutation.mutateAsync();
    // Invalidate queries to refetch counts and notification states
    queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count", userId] });
  }, [userId, unreadCount, markAllAsReadMutation, queryClient]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    if (!userId) return;
    await markAsReadMutation.mutateAsync(id);
  }, [userId, markAsReadMutation]);

  if (!userId) {
    return <div className="text-center p-8">Please log in to view notifications.</div>;
  }

  return (
    <>
      <NotificationHeader
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMarkingAllAsRead={markAllAsReadMutation.isPending}
      />

      <NotificationFilters
        notifications={mappedNotifications}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      <div className="mt-6">
        {isLoading ? (
          <NotificationListSkeleton />
        ) : (
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>

      <SettingsSheet isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}