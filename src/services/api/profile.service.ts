import { axiosInstance } from "@/src/axios/axios";
import { UserProfile } from "@/src/types/user.type";
import { API_ROUTES } from "@/src/constants/api.routes";

export const fetchProfileByUsername = async (username: string, headers?: Record<string, string>): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get(API_ROUTES.USERS.PROFILE_BY_USERNAME(username), { headers });
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    throw error;
  }
};
