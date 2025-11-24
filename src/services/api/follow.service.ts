import { api } from "@/src/app/lib/ky";
import { FollowerInfo } from "@/src/app/types";
import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

/**
 * ✅ FIXED: Follow a user.
 * Now accepts headers and passes them to the authenticated API call.
 * Uses centralized route constants.
 */
export const followUser = async (
  targetUserId: string,
  headers: Record<string, string>
) => {
  try {
    const result = await axiosInstance.post(
      API_ROUTES.FOLLOWS.FOLLOW,
      { targetUserId },
      { headers }
    );
    return result.data;
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      throw { status: 401, message: "Unauthorized" };
    }
    throw error;
  }
};

/**
 * ✅ FIXED: Unfollow a user.
 * Now accepts headers and passes them to the authenticated API call.
 * Uses centralized route constants.
 */
export const unfollowUser = async (
  targetUserId: string,
  headers: Record<string, string>
) => {
  try {
    await axiosInstance.post(API_ROUTES.FOLLOWS.UNFOLLOW, { targetUserId }, { headers });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      throw { status: 401, message: "Unauthorized" };
    }
    throw error;
  }
};

export const getFollowerInfo = async (userId: string, headers: Record<string, string>): Promise<FollowerInfo> => {
  try {
    const response = await api.get(API_ROUTES.FOLLOWS.FOLLOWERS_INFO(userId)).json<FollowerInfo>();
    return response;
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      throw { status: 401, message: 'Unauthorized' };
    }
    throw error;
  }
};

export const fetchFollowers = async (username: string, headers: Record<string, string>) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.USERS.FOLLOWERS(username), { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching followers for ${username}:`, error);
    throw error;
  }
};

export const fetchFollowing = async (username: string, headers: Record<string, string>) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.USERS.FOLLOWING(username), { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching following for ${username}:`, error);
    throw error;
  }
};
