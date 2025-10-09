
// app/services/api.ts
import { FollowerInfo } from '@/src/app/types';
import axiosInstance from '@/src/axios/axios';
import { authHeaders } from '@/src/utils/getAxioHeader';

// const API_URL = process.env.LOCAL_APIGATEWAY_URL as string;


export const fetchProfile = async (username: string) => {
  const headers = await authHeaders();;
  const response = await axiosInstance.get(`auth/user_profile/${username}`,{headers});
  console.log('this is the response coming from:', response);
  return response.data;
};

export const getFollowerInfo = async (userId: string):Promise<FollowerInfo> => {
  const headers = await authHeaders();
  const response = await axiosInstance.get(`auth/${userId}/followers`, { headers });
  return response.data;
};

export const fetchFollowing = async (username: string) => {
  const headers = await authHeaders();
  const response = await axiosInstance.get(`/following/${username}`, { headers });
  return response.data;
};

export const followUser = async (targetUserId: string) => {
  const headers = await authHeaders();
  await axiosInstance.post('/follow', { targetUserId }, { headers });
};

export const unfollowUser = async (targetUserId: string) => {
  const headers = await authHeaders();
  await axiosInstance.delete('/unfollow', {
    headers,
    data: { targetUserId },
  });
};

