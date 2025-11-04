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

// import { axiosInstance } from "@/src/axios/axios";

// /**
//  * Get notifications for a user
//  * @param userId - The user ID from the session
//  * @param headers - Auth headers with Authorization token
//  */
// export const getNotifications = async (userId: string, headers: Record<string, string>) => {
//   try {
//     const result = await axiosInstance.get(`notifications/${userId}`, {
//       headers,
//     });

//     return result.data;
//   } catch (error: any) {
//     if (error.message === "UNAUTHORIZED") {
//       throw { status: 401, message: "Unauthorized" };
//     }
//     throw error;
//   }
// };

// /**
//  * Get unread notifications count for a user
//  * @param userId - The user ID from the session
//  * @param headers - Auth headers with Authorization token
//  */
// export const getUnreadCount = async (userId: string, headers: Record<string, string>) => {
//   try {
//     const result = await axiosInstance.get(
//       `notifications/${userId}/unread-count`,
//       {
//         headers,
//       }
//     );

//     return result.data;
//   } catch (error: any) {
//     if (error.message === "UNAUTHORIZED") {
//       throw { status: 401, message: "Unauthorized" };
//     }
//     throw error;
//   }
// };


export const getNotificationsPage = async (
  userId: string,
  page: number,
  pageSize: number,
  headers: AuthHeaders
): Promise<GetNotificationsResult> => {
  const offset = page * pageSize;
  const res = await axiosInstance.get(`notifications/${userId}`, {
    params: { limit: pageSize, offset },
    headers,
  });
  return res.data?.data || { notifications: [], total: 0, hasMore: false };
};

export const getUnreadCount = async (
  userId: string,
  headers: AuthHeaders
): Promise<{ unreadCount: number }> => {
  const res = await axiosInstance.get(`notifications/${userId}/unread-count`, {
    headers,
  });
  return res.data?.data || { unreadCount: 0 };
};

export const markAsRead = async (
  notificationId: string,
  userId: string,
  headers: AuthHeaders
): Promise<void> => {
  await axiosInstance.patch(
    `notifications/${notificationId}/read`,
    { recipientId: userId },
    { headers }
  );
};

export const markAllAsRead = async (
  userId: string,
  headers: AuthHeaders
): Promise<void> => {
  await axiosInstance.post(
    `notifications/${userId}/mark-all-read`,
    {},
    { headers }
  );
};

export const deleteNotification = async (
  notificationId: string,
  userId: string,
  headers: AuthHeaders
): Promise<void> => {
  await axiosInstance.delete(`notifications/${notificationId}`, {
    data: { recipientId: userId },
    headers,
  });
};