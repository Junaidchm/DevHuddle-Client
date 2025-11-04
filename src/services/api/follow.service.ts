import { api } from "@/src/app/lib/ky";
import { FollowerInfo } from "@/src/app/types";
import { axiosInstance } from "@/src/axios/axios";

/**
 * ✅ FIXED: Follow a user.
 * Now accepts headers and passes them to the authenticated API call.
 */
export const followUser = async (
  targetUserId: string,
  headers: Record<string, string>
) => {
  try {

    console.log('the request is comming here ---------------------------------', targetUserId, headers)
    const result = await axiosInstance.post(
      "users/follows/follow",
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
 */
export const unfollowUser = async (
  targetUserId: string,
  headers: Record<string, string>
) => {
  try {

    console.log('the request is comming here ---------------------------------', targetUserId, headers)
    await axiosInstance.post("users/follows/unfollow", { targetUserId }, { headers });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      throw { status: 401, message: "Unauthorized" };
    }
    throw error;
  }
};


export const getFollowerInfo = async (userId: string,headers: Record<string, string>): Promise<FollowerInfo> => {
  try {
    const response = await api.get(`auth/${userId}/followers`).json<FollowerInfo>();
    return response;
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      throw { status: 401, message: 'Unauthorized' };
    }
    throw error;
  }
}