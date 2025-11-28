/**
 * Centralized API route configuration for frontend
 * Mirrors API Gateway routes for consistency
 *
 * This file serves as the single source of truth for all frontend API routes
 * to ensure consistency and maintainability across the codebase.
 */

const API_VERSION = "/api/v1";

export const API_ROUTES = {
  AUTH: {
    // gRPC routes (no version prefix, handled by authRouter at /auth)
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    PROFILE: "/auth/profile",
    VERIFY_OTP: "/auth/verify-otp",
    RESEND_OTP: "/auth/resend",
    PASSWORD_RESET: "/auth/password-reset",
    PASSWORD_RESET_CONFIRM: "/auth/password-reset/confirm",
    GENERATE_PRESIGNED_URL: "/auth/generate-presigned-url",
  },

  USERS: {
    PROFILE_BY_USERNAME: (username: string) =>
      `${API_VERSION}/users/${username}`,
    FOLLOWERS: (username: string) =>
      `${API_VERSION}/users/${username}/followers`,
    FOLLOWING: (username: string) =>
      `${API_VERSION}/users/${username}/following`,
    SEARCH: `${API_VERSION}/users/search`,
  },

  FOLLOWS: {
    SUGGESTIONS: `${API_VERSION}/users/follows/suggestions`,
    FOLLOW: `${API_VERSION}/users/follows/follow`,
    UNFOLLOW: `${API_VERSION}/users/follows/unfollow`,
    FOLLOWERS_INFO: (userId: string) =>
      `${API_VERSION}/users/${userId}/followers`,
  },

  ADMIN: {
    USERS: `${API_VERSION}/auth/admin/users`,
    USER_BY_ID: (id: string) => `${API_VERSION}/auth/admin/user/${id}`,
    TOGGLE_USER: (id: string) => `${API_VERSION}/auth/admin/users/${id}/toogle`,
  },

  NOTIFICATIONS: {
    BY_USER: (userId: string) => `${API_VERSION}/notifications/${userId}`,
    UNREAD_COUNT: (userId: string) =>
      `${API_VERSION}/notifications/${userId}/unread-count`,
    MARK_READ: (id: string) => `${API_VERSION}/notifications/${id}/read`,
    MARK_ALL_READ: (userId: string) =>
      `${API_VERSION}/notifications/${userId}/mark-all-read`,
    DELETE: (id: string) => `${API_VERSION}/notifications/${id}`,
  },

  FEED: {
    LIST: "/feed/list",
    SUBMIT: "/feed/submit",
    DELETE: "/feed/delete",
    MEDIA: "/feed/media",
  },

  ENGAGEMENT: {
    BASE: `${API_VERSION}/engagement`,
    // Post Likes
    LIKE_POST: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/likes`,
    UNLIKE_POST: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/likes`,
    POST_LIKE_STATUS: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/likes/status`,
    POST_LIKE_COUNT: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/likes/count`,
    // Comment Likes
    LIKE_COMMENT: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}/likes`,
    UNLIKE_COMMENT: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}/likes`,
    COMMENT_LIKE_COUNT: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}/likes/count`,
    COMMENT_LIKE_STATUS: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}/likes/status`,
    // Comments
    POST_COMMENTS: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/comments`,
    COMMENT_PREVIEW: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/comments/preview`,
    COMMENT_UPDATE: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}`,
    COMMENT_DELETE: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}`,
    COMMENT_DETAIL: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}`,
    // In ENGAGEMENT section, add:
    POST_COMMENT_COUNT: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/comments/count`,
    // Shares
    POST_SHARE: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/share`,
    POST_SHARE_STATUS: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/share/status`,
    POST_SHARE_COUNT: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/share/count`,
    // Reports
    POST_REPORT: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/report`,
    COMMENT_REPORT: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}/report`,
    // Mentions
    POST_MENTIONS: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/mentions`,
    COMMENT_MENTIONS: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}/mentions`,
    COMMENT_REPLIES: (commentId: string) =>
      `${API_VERSION}/engagement/comments/${commentId}/replies`,
  },
} as const;

/**
 * Get the API base URL based on environment
 * Handles both server-side and client-side scenarios
 */
export const getApiBaseUrl = (): string => {
  if (typeof window === "undefined") {
    // Server-side (Next.js server components, server actions)
    return (
      process.env.LOCAL_APIGATEWAY_URL ||
      process.env.API_GATEWAY ||
      "http://localhost:8080"
    );
  }
  // Client-side (browser)
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.LOCAL_APIGATEWAY_URL ||
    "http://localhost:8080"
  );
};
