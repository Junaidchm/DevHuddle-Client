import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

/**
 * Project service - API calls for project showcase feature
 * All protected API calls accept headers as parameters.
 */

export interface CreateProjectData {
  title: string;
  description: string;
  repositoryUrls?: string[];
  demoUrl?: string;
  techStack?: string[];
  tags?: string[];
  visibility?: string;
  mediaIds?: string[];
}

export interface UpdateProjectData {
  title?: string;
  description?: string;
  repositoryUrls?: string[];
  demoUrl?: string;
  techStack?: string[];
  tags?: string[];
  visibility?: string;
  mediaIds?: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  userId: string;
  repositoryUrls: string[];
  demoUrl?: string;
  techStack: string[];
  tags: string[];
  visibility: string;
  status: string;
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    viewsCount: number;
    isLiked: boolean;
    isShared: boolean;
  };
  media: Array<{
    id: string;
    type: string;
    url: string;
    thumbnailUrl?: string;
    order: number;
    isPreview: boolean;
  }>;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  trendingScore: number;
}

export interface ListProjectsResponse {
  projects: Project[];
  nextCursor?: string;
  totalCount: number;
}

// CRUD Operations
export const createProject = async (
  data: CreateProjectData,
  headers: Record<string, string>
): Promise<Project> => {
  try {
    const res = await axiosInstance.post(API_ROUTES.PROJECTS.CREATE, data, { headers });
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to create project");
  }
};

export const updateProject = async (
  projectId: string,
  data: UpdateProjectData,
  headers: Record<string, string>
): Promise<Project> => {
  try {
    const res = await axiosInstance.put(API_ROUTES.PROJECTS.UPDATE(projectId), data, {
      headers,
    });
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to update project");
  }
};

export const getProject = async (
  projectId: string,
  headers?: Record<string, string>
): Promise<Project> => {
  try {
    const res = await axiosInstance.get(API_ROUTES.PROJECTS.GET(projectId), {
      headers: headers || {},
    });
    return res.data.data.project;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to get project");
  }
};

export const listProjects = async (
  params: {
    cursor?: string | null;
    filter?: string;
    techStack?: string[];
    tags?: string[];
    period?: string;
    limit?: number;
  },
  headers: Record<string, string>
): Promise<ListProjectsResponse> => {
  try {
    const res = await axiosInstance.get(API_ROUTES.PROJECTS.LIST, {
      params,
      headers,
    });
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to list projects");
  }
};

export const deleteProject = async (
  projectId: string,
  headers: Record<string, string>
): Promise<void> => {
  try {
    await axiosInstance.delete(API_ROUTES.PROJECTS.DELETE(projectId), { headers });
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to delete project");
  }
};

export const publishProject = async (
  projectId: string,
  headers: Record<string, string>
): Promise<Project> => {
  try {
    const res = await axiosInstance.post(
      API_ROUTES.PROJECTS.PUBLISH(projectId),
      {},
      { headers }
    );
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to publish project");
  }
};

// Discovery
export const getTrendingProjects = async (
  params: {
    cursor?: string | null;
    period?: string;
    limit?: number;
  },
  headers: Record<string, string>
): Promise<ListProjectsResponse> => {
  try {
    const res = await axiosInstance.get(API_ROUTES.PROJECTS.TRENDING, {
      params,
      headers,
    });
    return res.data.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Failed to get trending projects"
    );
  }
};

export const getTopProjects = async (
  params: {
    cursor?: string | null;
    period?: string;
    limit?: number;
  },
  headers: Record<string, string>
): Promise<ListProjectsResponse> => {
  try {
    const res = await axiosInstance.get(API_ROUTES.PROJECTS.TOP, {
      params,
      headers,
    });
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to get top projects");
  }
};

export const searchProjects = async (
  query: string,
  filters: {
    cursor?: string | null;
    techStack?: string[];
    tags?: string[];
    limit?: number;
  },
  headers: Record<string, string>
): Promise<ListProjectsResponse> => {
  try {
    const res = await axiosInstance.get(API_ROUTES.PROJECTS.SEARCH, {
      params: { query, ...filters },
      headers,
    });
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to search projects");
  }
};

// Engagement
export const likeProject = async (
  projectId: string,
  headers: Record<string, string>
): Promise<{ isLiked: boolean; likesCount: number }> => {
  try {
    const res = await axiosInstance.post(
      API_ROUTES.PROJECTS.LIKE(projectId),
      {},
      { headers }
    );
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to like project");
  }
};

export const unlikeProject = async (
  projectId: string,
  headers: Record<string, string>
): Promise<{ isLiked: boolean; likesCount: number }> => {
  try {
    const res = await axiosInstance.delete(API_ROUTES.PROJECTS.UNLIKE(projectId), {
      headers,
    });
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to unlike project");
  }
};

export const shareProject = async (
  projectId: string,
  data: { caption?: string; shareType?: string },
  headers: Record<string, string>
): Promise<{ shareId: string; sharesCount: number }> => {
  try {
    const res = await axiosInstance.post(
      API_ROUTES.PROJECTS.SHARE(projectId),
      data,
      { headers }
    );
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to share project");
  }
};

export const reportProject = async (
  projectId: string,
  reason: string,
  metadata?: any,
  headers?: Record<string, string>
): Promise<{ reportId: string; success: boolean }> => {
  try {
    const res = await axiosInstance.post(
      API_ROUTES.PROJECTS.REPORT(projectId),
      { reason, metadata },
      { headers: headers || {} }
    );
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to report project");
  }
};

// Analytics
export const trackProjectView = async (
  projectId: string,
  headers?: Record<string, string>
): Promise<{ success: boolean; viewsCount: number }> => {
  try {
    const res = await axiosInstance.post(
      API_ROUTES.PROJECTS.VIEW(projectId),
      {},
      { headers: headers || {} }
    );
    return res.data.data;
  } catch (err: any) {
    // Don't throw error for view tracking - it's not critical
    return { success: false, viewsCount: 0 };
  }
};

// Media
export const uploadProjectMedia = async (
  formData: FormData,
  headers: Record<string, string>
): Promise<{ mediaId: string; url: string; thumbnailUrl?: string }> => {
  try {
    const res = await axiosInstance.post(API_ROUTES.PROJECTS.MEDIA_UPLOAD, formData, {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data;
  } catch (err: any) {
    throw new Error(
      err.response?.data?.message || "Failed to upload project media"
    );
  }
};

