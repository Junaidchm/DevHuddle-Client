import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

/**
 * Admin service functions for user management
 * All functions require auth headers with superAdmin role
 */

export const getAllUsers = async (
  {
    page = 1,
    limit = 5,
    status,
    search,
    date,
  }: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    date?: string;
  },
  headers?: Record<string, string>
) => {
  const params: any = { page, limit };
  if (status && status !== "all") params.status = status;
  if (date && date !== "all") params.date = date;
  if (search) params.search = search;
  const response = await axiosInstance.get(API_ROUTES.ADMIN.USERS, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const toogleUserBlock = async (userId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.patch(
    API_ROUTES.ADMIN.TOGGLE_USER(userId),
    {},
    { headers, withCredentials: true }
  );
  return response.data;
};

export const fetchUserFullDetails = async (userId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.USER_BY_ID(userId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};
