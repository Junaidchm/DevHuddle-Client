export interface StatCardProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string;
  trend: string;
  trendColor: string;
  trendIcon: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  profilePicture: string | null;
  name: string;
  password: string;
  location: string | null;
  bio: string | null;
  skills: string[];
  yearsOfExperience: string | null;
  jobTitle: string | null;
  company: string | null;
  emailVerified: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JwtPayload {
  email: string;
  jti: string;
  exp?: number;
  [key: string]: any;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}

export interface Suggestion {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  _count: { followers: number };
  isFollowedByUser: boolean;
}

export interface SuggestionsResponse {
  suggestions: Suggestion[];
}

// follows

export interface SuggestedFollower {
  id: string;
  username: string;
  name: string;
  profilePicture: string | null;
  // _count: {
  //   followers: number;
  // },
  followersCount:number;
  isFollowedByUser:boolean;
}

// Types based on backend NotificationObject schema
export interface Notification {
  id: string;
  type:
    | "FOLLOW"
    | "MENTION"
    | "COMMENT"
    | "LIKE"
    | "COLLAB"
    | "EVENT"
    | "MESSAGE"
    | "SUPPORT";
  entityId: string;
  summary: {
    text: string;
    actors: string[];
    count: number;
  };
  createdAt: string;
  readAt?: string | null;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export type AuthHeaders = Record<string, string>;

export interface GetNotificationsResult {
  notifications: Array<{
    id: string;
    type: string;
    entityType: string;
    entityId: string;
    contextId?: string | null;
    summary: any;
    metadata?: any;
    aggregatedCount: number;
    read: boolean;
    readAt?: string | null;
    createdAt: string;
    actors: string[];
  }>;
  total: number;
  hasMore: boolean;
}
