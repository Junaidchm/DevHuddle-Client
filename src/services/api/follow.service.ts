import { axiosInstance } from "@/src/axios/axios";


export const followUser = async (targetUserId: string) => {
  try {
    console.log('the following request is working without any problem -----------------> ')
    await axiosInstance.post("users/follows/follow", { targetUserId });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      throw { status: 401, message: "Unauthorized" };
    }
    throw error;
  }
};

export const unfollowUser = async (targetUserId: string) => {
  try {
    console.log('the unfollowing request is working without any problem -----------------> ')
    await axiosInstance.post("users/follows/unfollow", { targetUserId });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      throw { status: 401, message: "Unauthorized" };
    }
    throw error;
  }
};
