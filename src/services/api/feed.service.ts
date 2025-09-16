import { submitPostProp } from "@/src/app/types/feed";
import axiosInstance from "@/src/axios/axios";

// export const submitPost = async (newPost: submitPostProp
// ) => {

//   console.log('i am getting this data =============================', newPost)
//   const response = await axiosInstance.post("feed/post", newPost, {
//     withCredentials: true,
//   });
//   return response.data;
// };

export const fetchFeed = async ( cursor: string | null)  => {
  try {
    const res = await axiosInstance.get("feed/list", {
      params: { cursor },
      withCredentials: true,
    });

    const { pages, nextCursor } = res.data.data;

    console.log('==========================================================',pages,nextCursor)

    return {
      posts: pages,       
      nextCursor: nextCursor === 'null' ? null : nextCursor,
    };
  } catch (err) {
    throw new Error("Failed to fetch feed");
  }
};
