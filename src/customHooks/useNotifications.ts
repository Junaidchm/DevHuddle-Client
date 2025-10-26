"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotifications, getUnreadCount } from "../services/api/notification.service";
import { Notification, UnreadCountResponse } from "../app/types";
import { useSession } from "next-auth/react";
import { useAuthHeaders } from "../hooks/useAuthHeaders";

/**
 * ✅ FIXED: Custom hook to fetch notifications for the current user.
 *
 * This hook now correctly uses `useSession` to get the user's ID and
 * `useAuthHeaders` to get the authentication headers, passing them
 * explicitly to the `getNotifications` service function.
 */
export function useNotifications() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;

  return useQuery<Notification[], Error>({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId!, authHeaders),
    enabled: !!userId && !!authHeaders.Authorization, // Only run if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
/**
 * ✅ FIXED: Custom hook to fetch the unread notification count.
 *
 * Follows the correct pattern of using hooks to get session data
 * and passing it to the service function.
 */
export function useUnreadCount() {
  const { data: session } = useSession();
  const authHeaders = useAuthHeaders();
  const userId = session?.user?.id;
  return useQuery<UnreadCountResponse, Error>({
    queryKey: ["unread-count", userId],
    queryFn: () => getUnreadCount(userId!, authHeaders),
    enabled: !!userId && !!authHeaders.Authorization, // Only run if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
