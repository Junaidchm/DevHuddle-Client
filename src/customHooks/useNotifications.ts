"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useAuthHeaders } from "./useAuthHeaders";
import {
  deleteNotification,
  getNotificationsPage,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
  restoreNotification,
  clearAllNotifications,
} from "../services/api/notification.service";
import { queryKeys } from "@/src/lib/queryKeys";
import { GetNotificationsResult } from "../app/types";

const PAGE_SIZE = 20;

export function useNotificationsInfinite() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;

  return useInfiniteQuery<GetNotificationsResult, Error>({
    queryKey: queryKeys.notifications.list(userId!),
    queryFn: ({ pageParam = 0 }) =>
      getNotificationsPage(userId!, pageParam as number, PAGE_SIZE, authHeaders),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    initialPageParam: 0,
    enabled: !!userId && !!authHeaders.Authorization,
    // ✅ FIXED: Reduced staleTime to 0 to allow immediate refetch on WebSocket updates
    staleTime: 0,
    // ✅ FIXED: Set refetchOnWindowFocus to true for instant updates
    refetchOnWindowFocus: true,
  });
}

export function useUnreadCount() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;

  return useQuery<{ unreadCount: number }, Error>({
    queryKey: queryKeys.notifications.count(userId!),
    queryFn: () => getUnreadCount(userId!, authHeaders),
    enabled: !!userId && !!authHeaders.Authorization,
    // ✅ FIXED: Reduced staleTime to 0 for instant updates
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

export function useMarkAsRead() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markAsRead(notificationId, userId!, authHeaders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list(userId!) });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.count(userId!) });
    },
  });
}

export function useDeleteNotification() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      deleteNotification(notificationId, userId!, authHeaders),
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await qc.cancelQueries({ queryKey: queryKeys.notifications.list(userId!) });
      await qc.cancelQueries({ queryKey: queryKeys.notifications.count(userId!) });

      // Snapshot the previous value
      const previousNotifications = qc.getQueryData(queryKeys.notifications.list(userId!));

      // Optimistically update to remove the notification
      qc.setQueryData(
        queryKeys.notifications.list(userId!),
        (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              notifications: page.notifications.filter((n: any) => n.id !== notificationId),
            })),
          };
        }
      );

      return { previousNotifications };
    },
    onError: (err, newTodo, context) => {
      qc.setQueryData(queryKeys.notifications.list(userId!), context?.previousNotifications);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list(userId!) });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.count(userId!) });
    },
  });
}

export function useClearAllNotifications() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => clearAllNotifications(userId!, authHeaders),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.list(userId!) });
      await qc.cancelQueries({ queryKey: queryKeys.notifications.count(userId!) });
      
      const previousNotifications = qc.getQueryData(queryKeys.notifications.list(userId!));

      // Optimistically clear all notifications
      qc.setQueryData(queryKeys.notifications.list(userId!), {
        pages: [],
        pageParams: []
      });
      qc.setQueryData(queryKeys.notifications.count(userId!), { unreadCount: 0 });

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        qc.setQueryData(queryKeys.notifications.list(userId!), context.previousNotifications);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list(userId!) });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.count(userId!) });
    },
  });
}

export function useMarkAllAsRead() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(userId!, authHeaders),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list(userId!) });
      qc.setQueryData(queryKeys.notifications.count(userId!), { unreadCount: 0 });
    },
  });
}

export function useRestoreNotification() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ notificationId }: { notificationId: string; notification: any }) =>
      restoreNotification(notificationId, userId!, authHeaders),
    onMutate: async ({ notificationId, notification }) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.list(userId!) });

      const previousNotifications = qc.getQueryData(queryKeys.notifications.list(userId!));

      // Optimistically add the notification back
      qc.setQueryData(queryKeys.notifications.list(userId!), (old: any) => {
        if (!old) return old;
        // Add to the first page
        const newPages = [...old.pages];
        if (newPages.length > 0) {
          newPages[0] = {
            ...newPages[0],
            notifications: [notification, ...newPages[0].notifications],
          };
        }
        return { ...old, pages: newPages };
      });

      return { previousNotifications };
    },
    onError: (err, newTodo, context) => {
      qc.setQueryData(queryKeys.notifications.list(userId!), context?.previousNotifications);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.list(userId!) });
      qc.invalidateQueries({ queryKey: queryKeys.notifications.count(userId!) });
    },
  });
}