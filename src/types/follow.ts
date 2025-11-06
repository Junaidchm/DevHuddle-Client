// Types for Follow feature
export type FollowStatus = {
  isFollowing: boolean;
  followerCount: number;
};

export type FollowResponse = {
  success: boolean;
  data: {
    followers: number;
    isFollowedByUser: boolean;
  };
};

export type FollowerInfo = {
  followers: number;
  isFollowedByUser: boolean;
};

// Profile and network related types
export interface NetworkUser {
  id: string;
  username: string;
  name: string;
  role?: string;
  profilePicture?: string | null;
  followersCount: number;
  isFollowedByUser: boolean;
}