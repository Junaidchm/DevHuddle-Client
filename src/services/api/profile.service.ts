// app/services/api.ts
import axiosInstance from '@/src/axios/axios';
import axios from 'axios';

const API_URL = process.env.LOCAL_APIGATEWAY_URL as string;
export const fetchProfile = async (username: string) => {
  const response = await axios.get(`${API_URL}/auth/user_profile/${username}`);
  console.log('this is the response comming from : ' , response)
  return response.data;
};

export const fetchFollowers = async (username: string) => {
  const response = await axiosInstance.get(`/followers/${username}`);
  return response.data;
};

export const fetchFollowing =async (username: string) => {
  const response = await axiosInstance.get(`/following/${username}`);
  return response.data;
};

export const followUser = async (targetUserId: string) => {
  await axiosInstance.post('/follow', { targetUserId });
};

export const unfollowUser = async (targetUserId: string) => {
  await axiosInstance.delete('/unfollow', { data: { targetUserId } });
};

