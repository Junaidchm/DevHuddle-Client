import axiosInstance from "@/src/axios/axios";

export const getAllUsers = async ({
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
}) => {
  const params: any = { page, limit };
  if (status && status !== "all") params.status = status;
  if (date && date !== "all") params.date = date;
  if (search) params.search = search;
  const response = await axiosInstance.get("/auth/admin/users", {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const toogleUserBlock = async (userId: string) => {
  const response = await axiosInstance.patch(
    `/auth/admin/users/${userId}/toogle`
  );
  return response.data;
};

export const fetchUserFullDetails = async (userId: string) => {
  const response = await axiosInstance.get(`/auth/admin/user/${userId}`);
  console.log("this is the specific user data : ", response.data);
  return response.data;
};
