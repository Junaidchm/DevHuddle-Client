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
} from "@/src/components/notification";
import { MappedNotification, NotificationType } from "@/src/components/notification/types";
import { mapNotificationToLinkedInStyle } from "@/src/components/notification/notificationMapper";
import { queryKeys } from "@/src/lib/queryKeys";

export default function NotificationsClient() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();

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

  // Map notifications to LinkedIn-style format
  const mappedNotifications: MappedNotification[] = useMemo(() => {
    return flatNotifications.map(mapNotificationToLinkedInStyle);
  }, [flatNotifications]);

  // Client-side filtering (LinkedIn-style)
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return mappedNotifications;
    return mappedNotifications.filter((n) => n.type === activeFilter);
  }, [mappedNotifications, activeFilter]);

  const handleMarkAllAsRead = useCallback(async () => {
    console.log("Marking all as read initiated", { userId, unreadCount });
    if (!userId || unreadCount === 0) return;
    try {
      await markAllAsReadMutation.mutateAsync();
      console.log("Mark all as read mutation successful");
      // Invalidate queries to refetch counts and notification states
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count(userId) });
      console.log("Queries invalidated");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
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
    </>
  );
}