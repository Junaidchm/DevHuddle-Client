// import { submitPostProp } from "@/src/app/types/feed";
// import axiosInstance from "@/src/axios/axios";

// export const fetchFeed = async (cursor: string | null) => {
//   try {
    
//     console.log('this function is getting called but not returned')
//     const res = await axiosInstance.get("feed/list", {
//       params: { cursor },
//     });

//     const { pages, nextCursor } = res.data.data;

//     return {
//       posts: pages,
//       nextCursor: nextCursor === "null" ? null : nextCursor,
//     };
//   } catch (err) {
//     throw new Error("Failed to fetch feed");
//   }
// };

// export const uploadMedia = async (data: {
//   url: string;
//   type: "IMAGE" | "VIDEO";
// }) => {
//   try {
//     const res = await axiosInstance.post("feed/media", data, {
//       withCredentials: true,
//     });
//     return res.data;
//   } catch (err) {
//     throw new Error("Failed to fetch feed");
//   }
// };

import { axiosInstance } from "@/src/axios/axios";

/**
 * ✅ FIXED: Feed service
 * 
 * Protected API calls now accept headers as parameters.
 */

export const fetchFeed = async (cursor: string | null, headers: Record<string, string>) => {
  try {
    const res = await axiosInstance.get("feed/list", {
      params: { cursor },
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
    const res = await axiosInstance.post("feed/media", data, {
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
    const res = await axiosInstance.post("feed/submit", postData);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to create post");
  }
};

export const updatePost = async ({ postId, data }: { postId: string; data: any }) => {
  throw new Error("Post editing is temporarily unavailable (Backend not implemented).");
};

export const deletePost = async (postId: string) => {
  try {
    const res = await axiosInstance.delete(`feed/${postId}`);
    return res.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Failed to delete post");
  }
};
