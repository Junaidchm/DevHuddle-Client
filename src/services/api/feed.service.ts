

import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

/**
 * ✅ FIXED: Feed service
 * 
 * Protected API calls now accept headers as parameters.
 */

export const fetchFeed = async (
  cursor: string | null,
  headers: Record<string, string>,
  authorId?: string,
  sortBy: "RECENT" | "TOP" = "RECENT",
  limit?: number // Add limit parameter
) => {
  try {
    const res = await axiosInstance.get(API_ROUTES.FEED.LIST, {
      params: { cursor, authorId, sortBy, limit },
      headers,
    });

    const { pages, nextCursor } = res.data.data;

    return {
      posts: pages,
      nextCursor: nextCursor === "null" ? null : nextCursor,
    };
  } catch (err) {
    throw new Error("Failed to fetch feed");
  }
};

export const uploadMedia = async (
  data: { url: string; type: "IMAGE" | "VIDEO" },
  headers: Record<string, string>
) => {
  try {
    const res = await axiosInstance.post(API_ROUTES.FEED.MEDIA, data, {
      headers,
    });

    return res.data;
  } catch (err) {
    throw new Error("Failed to upload media");
  }
};
import { NewPost, Visibility, CommentControl } from "@/src/app/types/feed";

export interface CreatePostPayload {
  content: string;
  mediaIds: string[];
  visibility?: Visibility;
  commentControl?: CommentControl;
}

export const submitPost = async (postData: CreatePostPayload) => {
  try {
    const res = await axiosInstance.post(API_ROUTES.FEED.SUBMIT, postData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to create post");
  }
};

export const updatePost = async ({ postId, data }: { postId: string; data: any }) => {
  try {
    const res = await axiosInstance.patch(API_ROUTES.FEED.EDIT_POST(postId), data);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to update post");
  }
};

export const deletePost = async (postId: string) => {
  try {
    const res = await axiosInstance.delete(API_ROUTES.FEED.DELETE_POST(postId));
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to delete post");
  }
};

export const fetchPostById = async (postId: string, headers: Record<string, string>) => {
  try {
    const res = await axiosInstance.get(API_ROUTES.FEED.DETAILS(postId), {
      headers,
    });
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to fetch post details");
  }
};

