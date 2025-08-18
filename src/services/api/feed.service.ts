import { Post } from "@/src/app/types/feed";
import axiosInstance from "@/src/axios/axios";

export const submitPost = async (newPost: Post) => {

  let PostData = structuredClone(newPost);
  PostData.media = PostData.media?.map((f) => {
    if (f.file) {
      delete f.file;
    }
    if (f.url) {
      delete f.url;
    }
    return f;
  });

  console.log('this is the data  passing for post', PostData)
  
  const response = axiosInstance.post("feed/post", PostData);
  return response;
};
