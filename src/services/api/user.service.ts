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
  headers: Record<string, string>,
  limit: number = 10,
  offset: number = 0
): Promise<SearchedUser[]> => {
  if (!query) return [];
  try {
    const response = await axiosInstance.get<SearchedUser[]>(API_ROUTES.USERS.SEARCH, {
      params: { q: query, limit, offset },
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to search users:", error);
    throw new Error("Failed to search for users.");
  }
};

export const getConnections = async (
  username: string,
  headers: Record<string, string>,
  limit: number = 20,
  offset: number = 0
): Promise<SearchedUser[]> => {
  try {
    const response = await axiosInstance.get<SearchedUser[]>(API_ROUTES.USERS.FOLLOWING(username), {
      params: { limit, offset },
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch connections:", error);
    throw new Error("Failed to fetch connections.");
  }
};