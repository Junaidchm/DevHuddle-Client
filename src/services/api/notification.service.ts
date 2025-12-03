/**
 * ✅ FIXED: Notification service
 * 
 * ❌ PROBLEM: Using React hooks (useSession) in utility functions
 *    - Hooks can ONLY be used in React components
 *    - This would crash at runtime
 *    - Cannot access React context outside components
 * 
 * ✅ SOLUTION: Accept userId and headers as parameters
 *    - Services are pure functions that take what they need
 *    - Components pass session data explicitly
 *    - Follows separation of concerns
 */

import { AuthHeaders, GetNotificationsResult } from "@/src/app/types";
import { axiosInstance } from "@/src/axios/axios";


import { API_ROUTES } from "@/src/constants/api.routes";

export const getNotificationsPage = async (
  userId: string,
  page: number,
  pageSize: number,
  headers: AuthHeaders
): Promise<GetNotificationsResult> => {
  const offset = page * pageSize;
  const res = await axiosInstance.get(API_ROUTES.NOTIFICATIONS.BY_USER(userId), {
    params: { limit: pageSize, offset },
    headers,
  });
  return res.data?.data || { notifications: [], total: 0, hasMore: false };
};

export const getUnreadCount = async (
  userId: string,
  headers: AuthHeaders
): Promise<{ unreadCount: number }> => {
  const res = await axiosInstance.get(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT(userId), {
    headers,
  });
  return res.data?.data || { unreadCount: 0 };
};

export const markAsRead = async (
  notificationId: string,
  userId: string,
  headers: AuthHeaders
): Promise<void> => {
  // ✅ FIXED: Increase timeout for markAsRead to handle cache invalidation
  await axiosInstance.patch(
    API_ROUTES.NOTIFICATIONS.MARK_READ(notificationId),
    { recipientId: userId },
    { 
      headers,
      timeout: 30000, // 30 seconds instead of default 10 seconds
    }
  );
};

export const markAllAsRead = async (
  userId: string,
  headers: AuthHeaders
): Promise<void> => {
  // ✅ FIXED: Increase timeout for markAllAsRead to handle cache invalidation
  await axiosInstance.post(
    API_ROUTES.NOTIFICATIONS.MARK_ALL_READ(userId),
    {},
    { 
      headers,
      timeout: 30000, // 30 seconds instead of default 10 seconds
    }
  );
};

export const deleteNotification = async (
  notificationId: string,
  userId: string,
  headers: AuthHeaders
): Promise<void> => {
  await axiosInstance.delete(API_ROUTES.NOTIFICATIONS.DELETE(notificationId), {
    data: { recipientId: userId },
    headers,
  });
};