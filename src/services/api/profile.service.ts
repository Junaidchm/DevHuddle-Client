import { axiosInstance } from "@/src/axios/axios";
import { UserProfile } from "@/src/types/user.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchProfileByUsername = async (username: string, headers?: Record<string, string>): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get(`/users/profile/${username}`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    throw error;
  }
};

export const fetchFollowers = async (username: string, headers: Record<string, string>) => {
  try {
    console.log('fetch following is working without any proble ==========================>')
    const response = await axiosInstance.get(`/users/profile/${username}/followers`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching followers for ${username}:`, error);
    throw error;
  }
};

export const fetchFollowing = async (username: string, headers: Record<string, string>) => {
  try {
    console.log('fetch following is working without any proble ==========================>')
    const response = await axiosInstance.get(`/users/profile/${username}/following`, { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching following for ${username}:`, error);
    throw error;
  }
};

// export const followUser = async (userId: string, headers: Record<string, string>) => {
//   try {
//     const response = await axiosInstance.post(`${API_URL}/users/${userId}/follow`, {}, { headers });
//     return response.data;
//   } catch (error) {
//     console.error(`Error following user ${userId}:`, error);
//     throw error;
//   }
// };

// export const unfollowUser = async (userId: string, headers: Record<string, string>) => {
//   try {
//     const response = await axiosInstance.post(`${API_URL}/users/${userId}/unfollow`, {}, { headers });
//     return response.data;
//   } catch (error) {
//     console.error(`Error unfollowing user ${userId}:`, error);
//     throw error;
//   }
// };