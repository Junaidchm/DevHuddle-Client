import { Post } from "@/src/app/types/feed";
import axiosInstance from "@/src/axios/axios";

export const submitPost = async (newPost: Post) => {
  const response = await axiosInstance.post("feed/post", newPost, {
    withCredentials: true,
  });
  return response.data;
};

export const fetchFeed = async (userId: string, cursor: string | null) => {
  try {
    const res = await axiosInstance.get("feed/list", {
      params: { cursor },
      withCredentials: true,
    });


    const { pages, nextCursor } = res.data.data;

    return {
      posts: pages,       
      nextCursor: nextCursor,
    };
  } catch (err) {
    throw new Error("Failed to fetch feed");
  }
};
