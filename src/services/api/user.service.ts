import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

export interface SearchedUser {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
  avatar?: string;
  headline?: string;
  jobTitle?: string;
  company?: string;
}

export const searchUsers = async (
  query: string,
  headers: Record<string, string>
): Promise<SearchedUser[]> => {
  if (!query) return [];
  try {
    const response = await axiosInstance.get<SearchedUser[]>(API_ROUTES.USERS.SEARCH, {
      params: { q: query },
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to search users:", error);
    throw new Error("Failed to search for users.");
  }
};

export const getMyConnections = async (
  headers: Record<string, string>
): Promise<SearchedUser[]> => {
  try {
    const response = await axiosInstance.get<SearchedUser[]>(API_ROUTES.USERS.FOLLOWING('me'), {
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    throw new Error("Failed to fetch connections.");
  }
};