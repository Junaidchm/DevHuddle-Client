import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

// ==================== REPORTS ====================

export const getReports = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    targetType?: string;
    severity?: string;
    reason?: string;
    sortBy?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.REPORTS, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getReportById = async (reportId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.REPORT_BY_ID(reportId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const takeReportAction = async (
  reportId: string,
  data: {
    action: "APPROVE" | "REMOVE" | "IGNORE";
    resolution?: string;
    hideContent?: boolean;
    suspendUser?: boolean;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.patch(
    API_ROUTES.ADMIN.REPORT_ACTION(reportId),
    data,
    { headers, withCredentials: true }
  );
  return response.data;
};

export const bulkReportAction = async (
  data: {
    reportIds: string[];
    action: "APPROVE" | "REMOVE" | "IGNORE";
    resolution?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.post(
    API_ROUTES.ADMIN.REPORTS_BULK_ACTION,
    data,
    { headers, withCredentials: true }
  );
  return response.data;
};

// ==================== POSTS ====================

export const getPosts = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    search?: string;
    sortBy?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.POSTS, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getReportedPosts = async (
  params: {
    page?: number;
    limit?: number;
    userId?: string;
    search?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.POSTS_REPORTED, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getPostById = async (postId: string) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.POST_BY_ID(postId), {
    withCredentials: true,
  });
  return response.data;
};

export const hidePost = async (postId: string, data: { hidden: boolean; reason?: string }, headers?: Record<string, string>) => {
  const response = await axiosInstance.patch(
    API_ROUTES.ADMIN.POST_HIDE(postId),
    data,
    { headers, withCredentials: true }
  );
  return response.data;
};

export const deletePostAdmin = async (postId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.delete(API_ROUTES.ADMIN.POST_DELETE(postId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};

// ==================== COMMENTS ====================

export const getComments = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  postId?: string;
  userId?: string;
  search?: string;
  sortBy?: string;
}) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.COMMENTS, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const getReportedComments = async (params: {
  page?: number;
  limit?: number;
  postId?: string;
  userId?: string;
  search?: string;
}) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.COMMENTS_REPORTED, {
    params,
    withCredentials: true,
  });
  return response.data;
};

export const getCommentById = async (commentId: string) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.COMMENT_BY_ID(commentId), {
    withCredentials: true,
  });
  return response.data;
};

export const deleteCommentAdmin = async (commentId: string) => {
  const response = await axiosInstance.delete(API_ROUTES.ADMIN.COMMENT_DELETE(commentId), {
    withCredentials: true,
  });
  return response.data;
};

// ==================== ANALYTICS ====================

export const getDashboardStats = async (headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.ANALYTICS_DASHBOARD, {
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getReportsByReason = async () => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.ANALYTICS_REPORTS_BY_REASON, {
    withCredentials: true,
  });
  return response.data;
};

export const getReportsBySeverity = async () => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.ANALYTICS_REPORTS_BY_SEVERITY, {
    withCredentials: true,
  });
  return response.data;
};

// ==================== USER-RELATED ADMIN QUERIES ====================

export const getUserReportedContent = async (userId: string) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.USER_REPORTED_CONTENT(userId), {
    withCredentials: true,
  });
  return response.data;
};

export const getUserReportsHistory = async (userId: string) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.USER_REPORTS(userId), {
    withCredentials: true,
  });
  return response.data;
};

