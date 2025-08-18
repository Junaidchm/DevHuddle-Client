import { FeedResponse, Post } from "@/src/app/types/feed";
import { submitPost } from "@/src/services/api/feed.service";
import { User } from "@/src/types/auth";
import {
  InfiniteData,
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

interface useSubmitPostMutationProp {
  userId: string;
  setShowSuccess?: (value: boolean) => void;
  setError?: (value: string | null) => void;
  setIsPosting?: (value: boolean) => void;
  setPostContent?: (value: string) => void;
  setSelectedMedia?: (value: any[]) => void;
  setPoll?: (value: any | null) => void;
  setAudienceType?: (value: string) => void;
  setCommentControl?: (value: string) => void;
  setBrandPartnership?: (value: boolean) => void;
  onClose?: () => void;
}

export function useSubmitPostMutation({
  userId,
  setShowSuccess,
  setError,
  setIsPosting,
  setPostContent,
  setSelectedMedia,
  setPoll,
  setAudienceType,
  setCommentControl,
  setBrandPartnership,
  onClose,
}: Partial<useSubmitPostMutationProp>) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitPost,
    retry: 1,
    onMutate: async (newPost: Post) => {
      const feedkey = ["feed", { userId }];
      await queryClient.cancelQueries({ queryKey: feedkey });

      // copiying the old data
      const previousData =
        queryClient.getQueryData<InfiniteData<FeedResponse, string | null>>(
          feedkey
        );

      const tempId = `temp-${Date.now()}`;

      // optimistically updating the cache data
      queryClient.setQueryData<InfiniteData<FeedResponse, string | null>>(
        feedkey,
        (oldData) => {
          if (!oldData) return oldData;
          const firstPage = oldData.pages[0];
          if (!firstPage) return oldData;

          return {
            pageParams: oldData.pageParams,
            pages: [
              {
                posts: [{ ...newPost, id: tempId }],
                nextCursor: firstPage.nextCursor,
              },
              ...oldData.pages.slice(1),
            ],
          };
        }
      );

      return { previousData, tempId };
    },
    onError: (error, variables, context) => {
      const feedKey = ["feed", { userId }];
      if (context?.previousData) {
        queryClient.setQueryData<InfiniteData<FeedResponse, string | null>>(
          feedKey,
          context.previousData
        );
      }

      console.error("Post creation error:", error);
      // setError("Failed to post. Please try again.");
      // setTimeout(() => setError(null), 3000);
      // setIsPosting(false);
      toast.error("Failed to post. Please try again.");
      //   toast({
      //     variant: "destructive",
      //     description: "Failed to post. Please try again.",
      //   });
    },
    // onSuccess: (newPost, variables, context) => {
    //   const feedKey = ["feed", { userId }];
    //   queryClient.setQueryData<InfiniteData<FeedResponse, string | null>>(
    //     feedKey,
    //     (oldData) => {
    //       if (!oldData) return oldData;
    //       const firstPage = oldData.pages[0];
    //       if (!firstPage) return oldData;

    //       return {
    //         pageParams: oldData.pageParams,
    //         pages: [
    //           {
    //             posts: [
    //               newPost,
    //               ...firstPage.posts.filter(
    //                 (post) => post.id !== context.tempId
    //               ),
    //             ],
    //             nextCursor: firstPage.nextCursor,
    //           },
    //           ...oldData.pages.slice(1),
    //         ],
    //       };
    //     }
    //   );
    // },
  });

  return mutation
}
