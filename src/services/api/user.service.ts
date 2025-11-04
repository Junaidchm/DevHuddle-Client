import { axiosInstance } from "@/src/axios/axios";

export interface SearchedUser {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
}

export const searchUsers = async (
  query: string,
  headers: Record<string, string>
): Promise<SearchedUser[]> => {
  if (!query) return [];
  try {
    const response = await axiosInstance.get<SearchedUser[]>(`/users/search`, {
      params: { q: query },
      headers,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to search users:", error);
    throw new Error("Failed to search for users.");
  }
};