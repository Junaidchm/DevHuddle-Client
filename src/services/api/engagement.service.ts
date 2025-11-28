// ========== LIKE OPERATIONS ==========

import {
  LikeCountResponse,
  LikeResponse,
  LikeStatusResponse,
} from "@/src/app/types/feed";
import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

// ========== LIKE OPERATIONS ==========

/**
 * Like a post
 */
export const likePost = async (
  postId: string,
  headers: Record<string, string>,
  idempotencyKey?: string
): Promise<LikeResponse> => {
  try {
    const res = await axiosInstance.post(
      API_ROUTES.ENGAGEMENT.LIKE_POST(postId),
      {},
      {
        headers: {
          ...headers,
          ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
        },
      }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to like post");
  }
};

/**
 * Unlike a post
 */
export const unlikePost = async (
  postId: string,
  headers: Record<string, string>,
  idempotencyKey?: string
): Promise<LikeResponse> => {
  try {
    const res = await axiosInstance.delete(
      API_ROUTES.ENGAGEMENT.UNLIKE_POST(postId),
      {
        headers: {
          ...headers,
          ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
        },
      }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to unlike post");
  }
};

/**
 * Check if post is liked by user
 */
export const getPostLikeStatus = async (
  postId: string,
  headers: Record<string, string>
): Promise<LikeStatusResponse> => {
  try {
    const res = await axiosInstance.get(
      API_ROUTES.ENGAGEMENT.POST_LIKE_STATUS(postId),
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to get like status"
    );
  }
};

/**
 * Get post like count
 */
export const getPostLikeCount = async (
  postId: string,
  headers: Record<string, string>
): Promise<LikeCountResponse> => {
  try {
    const res = await axiosInstance.get(
      API_ROUTES.ENGAGEMENT.POST_LIKE_COUNT(postId),
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to get like count"
    );
  }
};

/**
 * Like a comment
 */
export const likeComment = async (
  commentId: string,
  headers: Record<string, string>
): Promise<LikeResponse> => {
  try {
    const res = await axiosInstance.post(
      API_ROUTES.ENGAGEMENT.LIKE_COMMENT(commentId),
      {},
      { headers }
    );
    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to like comment";
    console.error("Like comment error:", {
      commentId,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });
    throw new Error(errorMessage);
  }
};

/**
 * Unlike a comment
 */
export const unlikeComment = async (
  commentId: string,
  headers: Record<string, string>
): Promise<LikeResponse> => {
  try {
    const res = await axiosInstance.delete(
      API_ROUTES.ENGAGEMENT.UNLIKE_COMMENT(commentId),
      { headers }
    );
    return res.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to unlike comment";
    console.error("Unlike comment error:", {
      commentId,
      status: error.response?.status,
      message: errorMessage,
      data: error.response?.data,
    });
    throw new Error(errorMessage);
  }
};

/**
 * Get comment like count
 */
export const getCommentLikeCount = async (
  commentId: string,
  headers: Record<string, string>
): Promise<LikeCountResponse> => {
  try {
    const res = await axiosInstance.get(
      API_ROUTES.ENGAGEMENT.COMMENT_LIKE_COUNT(commentId),
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to get comment like count"
    );
  }
};

/**
 * Check if comment is liked by user
 */
export const getCommentLikeStatus = async (
  commentId: string,
  headers: Record<string, string>
): Promise<LikeStatusResponse> => {
  try {
    const res = await axiosInstance.get(
      API_ROUTES.ENGAGEMENT.COMMENT_LIKE_STATUS(commentId),
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to get comment like status"
    );
  }
};

// ========== COMMENT OPERATIONS ==========

import { Comment, CommentListResponse } from "@/src/app/types/feed";

/**
 * Create a comment on a post
 */
export const createComment = async (
  postId: string,
  content: string,
  headers: Record<string, string>,
  parentCommentId?: string,
  idempotencyKey?: string
): Promise<{ success: boolean; data: Comment }> => {
  try {
    const res = await axiosInstance.post(
      API_ROUTES.ENGAGEMENT.POST_COMMENTS(postId),
      {
        content,
        parentCommentId,
      },
      {
        headers: {
          ...headers,
          ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
        },
      }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to create comment"
    );
  }
};

/**
 * Update a comment
 */
export const updateComment = async (
  commentId: string,
  content: string,
  headers: Record<string, string>,
  idempotencyKey?: string
): Promise<{ success: boolean; data: Comment }> => {
  try {
    const res = await axiosInstance.patch(
      API_ROUTES.ENGAGEMENT.COMMENT_UPDATE(commentId),
      { content },
      {
        headers: {
          ...headers,
          ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
        },
      }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to update comment"
    );
  }
};

/**
 * Delete a comment
 */
export const deleteComment = async (
  commentId: string,
  headers: Record<string, string>,
  idempotencyKey?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await axiosInstance.delete(
      API_ROUTES.ENGAGEMENT.COMMENT_DELETE(commentId),
      {
        headers: {
          ...headers,
          ...(idempotencyKey && { "Idempotency-Key": idempotencyKey }),
        },
      }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete comment"
    );
  }
};

/**
 * Get comment preview (first comment) for LinkedIn-style display
 */
export const getCommentPreview = async (
  postId: string,
  headers: Record<string, string>
): Promise<{ success: boolean; data: { comment: Comment | null; totalCount: number; hasMore: boolean } }> => {
  try {
    const res = await axiosInstance.get(
      API_ROUTES.ENGAGEMENT.COMMENT_PREVIEW(postId),
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to get comment preview"
    );
  }
};

/**
 * Get comments for a post with pagination
 */
export const getComments = async (
  postId: string,
  limit: number = 20,
  offset: number = 0,
  headers: Record<string, string>
): Promise<CommentListResponse> => {
  try {
    const res = await axiosInstance.get(
      `${API_ROUTES.ENGAGEMENT.POST_COMMENTS(
        postId
      )}?limit=${limit}&offset=${offset}`,
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to get comments");
  }
};

/**
 * Get comment count for a post
 */
export const getCommentCount = async (
  postId: string,
  headers: Record<string, string>
): Promise<{ success: boolean; count: number }> => {
  try {
    const res = await axiosInstance.get(
      `${API_ROUTES.ENGAGEMENT.POST_COMMENTS(postId)}/count`,
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to get comment count"
    );
  }
};

/**
 * Get replies for a comment
 */
export const getCommentReplies = async (
  commentId: string,
  limit: number = 10,
  headers: Record<string, string>
): Promise<CommentListResponse> => {
  try {
    const res = await axiosInstance.get(
      `${API_ROUTES.ENGAGEMENT.COMMENT_REPLIES(commentId)}?limit=${limit}`,
      { headers }
    );
    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to get comment replies"
    );
  }
};
