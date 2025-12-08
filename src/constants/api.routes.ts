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
    // HTTP routes (proxied through API Gateway at /api/v1/auth)
    LOGIN: `${API_VERSION}/auth/login`,
    SIGNUP: `${API_VERSION}/auth/signup`,
    LOGOUT: `${API_VERSION}/auth/logout`,
    REFRESH: `${API_VERSION}/auth/refresh`,
    ME: `${API_VERSION}/auth/me`,
    PROFILE: `${API_VERSION}/auth/profile`,
    VERIFY_OTP: `${API_VERSION}/auth/verify-otp`,
    RESEND_OTP: `${API_VERSION}/auth/resend`,
    PASSWORD_RESET: `${API_VERSION}/auth/password-reset`,
    PASSWORD_RESET_CONFIRM: `${API_VERSION}/auth/password-reset/confirm`,
    GENERATE_PRESIGNED_URL: `${API_VERSION}/auth/generate-presigned-url`,
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
    // User Management (Auth Service)
    USERS: `${API_VERSION}/auth/admin/users`,
    USER_BY_ID: (id: string) => `${API_VERSION}/auth/admin/user/${id}`,
    TOGGLE_USER: (id: string) => `${API_VERSION}/auth/admin/users/${id}/toogle`,
    USER_REPORTED_CONTENT: (userId: string) => `${API_VERSION}/admin/users/${userId}/reported-content`,
    USER_REPORTS: (userId: string) => `${API_VERSION}/admin/users/${userId}/reports`,
    // Reports Management (Post Service)
    REPORTS: `${API_VERSION}/admin/reports`,
    REPORT_BY_ID: (id: string) => `${API_VERSION}/admin/reports/${id}`,
    REPORT_ACTION: (id: string) => `${API_VERSION}/admin/reports/${id}/action`,
    REPORTS_BULK_ACTION: `${API_VERSION}/admin/reports/bulk-action`,
    // Posts Management (Post Service)
    POSTS: `${API_VERSION}/admin/posts`,
    POSTS_REPORTED: `${API_VERSION}/admin/posts/reported`,
    POST_BY_ID: (id: string) => `${API_VERSION}/admin/posts/${id}`,
    POST_HIDE: (id: string) => `${API_VERSION}/admin/posts/${id}/hide`,
    POST_DELETE: (id: string) => `${API_VERSION}/admin/posts/${id}`,
    // Comments Management (Post Service)
    COMMENTS: `${API_VERSION}/admin/comments`,
    COMMENTS_REPORTED: `${API_VERSION}/admin/comments/reported`,
    COMMENT_BY_ID: (id: string) => `${API_VERSION}/admin/comments/${id}`,
    COMMENT_DELETE: (id: string) => `${API_VERSION}/admin/comments/${id}`,
    // Analytics (Post Service)
    ANALYTICS_DASHBOARD: `${API_VERSION}/admin/analytics/dashboard`,
    ANALYTICS_REPORTS_BY_REASON: `${API_VERSION}/admin/analytics/reports-by-reason`,
    ANALYTICS_REPORTS_BY_SEVERITY: `${API_VERSION}/admin/analytics/reports-by-severity`,
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
    EDIT_POST: (postId: string) => `${API_VERSION}/feed/posts/${postId}`,
    POST_VERSIONS: (postId: string) => `${API_VERSION}/feed/posts/${postId}/versions`,
    RESTORE_VERSION: (postId: string, versionNumber: number) =>
      `${API_VERSION}/feed/posts/${postId}/versions/${versionNumber}/restore`,
  },

  MEDIA: {
    UPLOAD_SESSION: `${API_VERSION}/media/upload-session`,
    COMPLETE: (mediaId: string) => `${API_VERSION}/media/${mediaId}/complete`,
    GET: (mediaId: string) => `${API_VERSION}/media/${mediaId}`,
    DELETE: (mediaId: string) => `${API_VERSION}/media/${mediaId}`,
    USER_MEDIA: `${API_VERSION}/media/user/media`,
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
    // Send Post
    GET_CONNECTIONS: `${API_VERSION}/engagement/connections`,
    SEND_POST: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/send`,
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
    // Post Share Link
    POST_SHARE_LINK: (postId: string) =>
      `${API_VERSION}/engagement/posts/${postId}/share-link`,
  },

  PROJECTS: {
    BASE: `${API_VERSION}/projects`,
    LIST: `${API_VERSION}/projects`,
    CREATE: `${API_VERSION}/projects`,
    GET: (projectId: string) => `${API_VERSION}/projects/${projectId}`,
    UPDATE: (projectId: string) => `${API_VERSION}/projects/${projectId}`,
    DELETE: (projectId: string) => `${API_VERSION}/projects/${projectId}`,
    PUBLISH: (projectId: string) => `${API_VERSION}/projects/${projectId}/publish`,
    TRENDING: `${API_VERSION}/projects/trending`,
    TOP: `${API_VERSION}/projects/top`,
    SEARCH: `${API_VERSION}/projects/search`,
    MEDIA_UPLOAD: `${API_VERSION}/projects/media`,
    LIKE: (projectId: string) => `${API_VERSION}/projects/${projectId}/like`,
    UNLIKE: (projectId: string) => `${API_VERSION}/projects/${projectId}/like`,
    SHARE: (projectId: string) => `${API_VERSION}/projects/${projectId}/share`,
    REPORT: (projectId: string) => `${API_VERSION}/projects/${projectId}/report`,
    VIEW: (projectId: string) => `${API_VERSION}/projects/${projectId}/view`,
  },
} as const;

/**
 * Get the API base URL based on environment
 * Handles both server-side and client-side scenarios
 * 
 * ✅ FIXED: Properly handles server-side middleware context
 */
export const getApiBaseUrl = (): string => {
  // Server-side (Next.js server components, server actions, middleware)
  if (typeof window === "undefined") {
    const url = 
      process.env.LOCAL_APIGATEWAY_URL ||
      process.env.API_GATEWAY ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080";
    
    // Ensure URL doesn't end with slash
    return url.endsWith("/") ? url.slice(0, -1) : url;
  }
  
  // Client-side (browser)
  const url = 
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.LOCAL_APIGATEWAY_URL ||
    "http://localhost:8080";
  
  // Ensure URL doesn't end with slash
  return url.endsWith("/") ? url.slice(0, -1) : url;
};
