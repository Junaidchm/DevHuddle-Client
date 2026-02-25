import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

// ==================== REPORTS ====================

export const getReports = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    targetType?: string;
    severity?: string;
    reason?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
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
    status: "PENDING" | "INVESTIGATING" | "RESOLVED_APPROVED" | "RESOLVED_REMOVED" | "RESOLVED_IGNORED" | "CLOSED";
    resolution: string;
    enforcementAction?: "SUSPEND" | "BAN" | "HIDE" | "WARN";
    severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  },
  headers?: Record<string, string>
) => {
  // ✅ FIXED: Increased timeout to 30 seconds for admin report actions
  // These actions may involve database updates, content hiding, and user suspension
  const response = await axiosInstance.patch(
    API_ROUTES.ADMIN.REPORT_ACTION(reportId),
    data,
    { 
      headers, 
      withCredentials: true,
      timeout: 30 * 1000, // 30 seconds timeout for admin actions
    }
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
  // ✅ FIXED: Increased timeout to 60 seconds for bulk actions
  // Bulk actions process multiple reports and may take longer
  const response = await axiosInstance.post(
    API_ROUTES.ADMIN.REPORTS_BULK_ACTION,
    data,
    { 
      headers, 
      withCredentials: true,
      timeout: 60 * 1000, // 60 seconds timeout for bulk actions
    }
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

export const getPostById = async (postId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.POST_BY_ID(postId), {
    headers,
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

export const getComments = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    postId?: string;
    userId?: string;
    search?: string;
    sortBy?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.COMMENTS, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getReportedComments = async (
  params: {
    page?: number;
    limit?: number;
    postId?: string;
    userId?: string;
    search?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.COMMENTS_REPORTED, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const hideComment = async (commentId: string, data: { hidden: boolean; reason?: string }, headers?: Record<string, string>) => {
  const response = await axiosInstance.patch(
    API_ROUTES.ADMIN.COMMENT_HIDE(commentId),
    data,
    { headers, withCredentials: true }
  );
  return response.data;
};

export const getCommentById = async (commentId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.COMMENT_BY_ID(commentId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const deleteCommentAdmin = async (commentId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.delete(API_ROUTES.ADMIN.COMMENT_DELETE(commentId), {
    headers,
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

export const getReportsByReason = async (headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.ANALYTICS_REPORTS_BY_REASON, {
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getReportsBySeverity = async (headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.ANALYTICS_REPORTS_BY_SEVERITY, {
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getAuditLogs = async (
  params: {
    page?: number;
    limit?: number;
    adminId?: string;
    targetType?: string;
    search?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.AUDIT_LOGS, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

// ==================== USER-RELATED ADMIN QUERIES ====================

export const getUserReportedContent = async (userId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.USER_REPORTED_CONTENT(userId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getUserReportsHistory = async (userId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.USER_REPORTS(userId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};

// ==================== PROJECTS ====================

export const getProjects = async (
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
  const response = await axiosInstance.get(API_ROUTES.ADMIN.PROJECTS, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getReportedProjects = async (
  params: {
    page?: number;
    limit?: number;
    userId?: string;
    search?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.PROJECTS_REPORTED, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getProjectById = async (projectId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.PROJECT_BY_ID(projectId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const hideProject = async (projectId: string, data: { hidden: boolean; reason?: string }, headers?: Record<string, string>) => {
  const response = await axiosInstance.patch(
    API_ROUTES.ADMIN.PROJECT_HIDE(projectId),
    data,
    { headers, withCredentials: true }
  );
  return response.data;
};

export const deleteProjectAdmin = async (projectId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.delete(API_ROUTES.ADMIN.PROJECT_DELETE(projectId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};

// ==================== HUBS ====================

export const getHubs = async (
  params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.HUBS, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getReportedHubs = async (
  params: {
    page?: number;
    limit?: number;
    search?: string;
  },
  headers?: Record<string, string>
) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.HUBS_REPORTED, {
    params,
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const getHubById = async (hubId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.ADMIN.HUB_BY_ID(hubId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};

export const suspendHub = async (hubId: string, data: { suspended: boolean; reason?: string }, headers?: Record<string, string>) => {
  const response = await axiosInstance.patch(
    API_ROUTES.ADMIN.HUB_SUSPEND(hubId),
    data,
    { headers, withCredentials: true }
  );
  return response.data;
};

export const deleteHubAdmin = async (hubId: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.delete(API_ROUTES.ADMIN.HUB_DELETE(hubId), {
    headers,
    withCredentials: true,
  });
  return response.data;
};
