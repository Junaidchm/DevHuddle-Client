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
} from "../services/api/notification.service";
import { GetNotificationsResult } from "../app/types";

const PAGE_SIZE = 20;

export function useNotificationsInfinite() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;

  return useInfiniteQuery<GetNotificationsResult, Error>({
    queryKey: ["notifications", userId],
    queryFn: ({ pageParam = 0 }) =>
      getNotificationsPage(userId!, pageParam as number, PAGE_SIZE, authHeaders),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    initialPageParam: 0, // ADD THIS LINE
    enabled: !!userId && !!authHeaders.Authorization,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUnreadCount() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;

  return useQuery<{ unreadCount: number }, Error>({
    queryKey: ["unread-count", userId],
    queryFn: () => getUnreadCount(userId!, authHeaders),
    enabled: !!userId && !!authHeaders.Authorization,
    staleTime: 5 * 60 * 1000,
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
      qc.invalidateQueries({ queryKey: ["notifications", userId] });
      qc.invalidateQueries({ queryKey: ["unread-count", userId] });
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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications", userId] });
      qc.invalidateQueries({ queryKey: ["unread-count", userId] });
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
      qc.invalidateQueries({ queryKey: ["notifications", userId] });
      qc.setQueryData(["unread-count", userId], { unreadCount: 0 });
    },
  });
}