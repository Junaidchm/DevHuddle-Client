import { submitPostProp } from "@/src/app/types/feed";
import axiosInstance from "@/src/axios/axios";

export const fetchFeed = async (cursor: string | null) => {
  try {
    const res = await axiosInstance.get("feed/list", {
      params: { cursor },
      withCredentials: true,
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

export const uploadMedia = async (data: {
  url: string;
  type: "IMAGE" | "VIDEO";
}) => {
  try {
    const res = await axiosInstance.post("feed/media", data, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw new Error("Failed to fetch feed");
  }
};
