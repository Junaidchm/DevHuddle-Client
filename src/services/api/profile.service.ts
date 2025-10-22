
// app/services/api.ts
import { api } from '@/src/app/lib/ky';
import { FollowerInfo } from '@/src/app/types';


export const fetchProfile = async (username: string) => {
  try {
    const response = await api.get(`auth/user_profile/${username}`).json();
    console.log('this is the response coming from:', response);
    return response;
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      throw { status: 401, message: 'Unauthorized' };
    }
    throw error;
  }
};

export const getFollowerInfo = async (userId: string): Promise<FollowerInfo> => {
  try {
    const response = await api.get(`auth/${userId}/followers`).json<FollowerInfo>();
    return response;
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      throw { status: 401, message: 'Unauthorized' };
    }
    throw error;
  }
};

export const fetchFollowing = async (username: string) => {
  try {
    const response = await api.get(`following/${username}`).json();
    return response;
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      throw { status: 401, message: 'Unauthorized' };
    }
    throw error;
  }
};



export const unfollowUser = async (targetUserId: string) => {
  try {
    await api.delete('unfollow', { json: { targetUserId } });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      throw { status: 401, message: 'Unauthorized' };
    }
    throw error;
  }
};

