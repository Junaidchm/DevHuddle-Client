// ========== LIKE OPERATIONS ==========

import { LikeCountResponse, LikeResponse, LikeStatusResponse } from "@/src/app/types/feed";
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
        { headers : {
          ...headers,
          ...(idempotencyKey && { "Idempotency-Key": idempotencyKey })
        }}
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
        { headers : {
          ...headers,
          ...(idempotencyKey && { "Idempotency-Key": idempotencyKey })
        } }
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
      throw new Error(error.response?.data?.message || "Failed to like comment");
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
      throw new Error(
        error.response?.data?.message || "Failed to unlike comment"
      );
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