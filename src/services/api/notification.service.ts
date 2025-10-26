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

import { axiosInstance } from "@/src/axios/axios";

/**
 * Get notifications for a user
 * @param userId - The user ID from the session
 * @param headers - Auth headers with Authorization token
 */
export const getNotifications = async (userId: string, headers: Record<string, string>) => {
  try {
    const result = await axiosInstance.get(`notifications/${userId}`, {
      headers,
    });

    return result.data;
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      throw { status: 401, message: "Unauthorized" };
    }
    throw error;
  }
};

/**
 * Get unread notifications count for a user
 * @param userId - The user ID from the session
 * @param headers - Auth headers with Authorization token
 */
export const getUnreadCount = async (userId: string, headers: Record<string, string>) => {
  try {
    const result = await axiosInstance.get(
      `notifications/${userId}/unread-count`,
      {
        headers,
      }
    );

    return result.data;
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      throw { status: 401, message: "Unauthorized" };
    }
    throw error;
  }
};
