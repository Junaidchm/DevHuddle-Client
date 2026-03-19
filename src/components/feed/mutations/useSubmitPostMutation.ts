
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { submitPost } from "../feedEditor/actions/submitPost";
import { AudienceType, CommentControl } from "@/src/contexts/PostCreationContext";
import { useSession } from "next-auth/react";
import { NewPost, PostsPage } from "@/src/app/types/feed";
import { toast } from "sonner"; 
import { queryKeys } from "@/src/lib/queryKeys";

interface CreatePostPayload {
  content: string;
  mediaIds: string[];
  visibility: AudienceType;
  commentControl: CommentControl;
  mediaTags?: any[];
}

export function useSubmitPostMutation() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const result = await submitPost(payload);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create post");
      }
      return result;
    },
    // Optimistic Update: Update UI before server response
    onMutate: async (payload: CreatePostPayload) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.feed.all });

      // 2. Snapshot the previous value
      const previousFeed = queryClient.getQueryData<InfiniteData<PostsPage>>(queryKeys.feed.list({ sortBy: "RECENT" }));

      // 3. Optimistically update to the new value
      if (session?.user) {
        const optimisticPost: NewPost = {
          id: Date.now().toString(), // Temporary ID
          content: payload.content,
          mediaIds: payload.mediaIds,
          userId: session.user.id,
          createdAt: new Date().toISOString(),
          user: {
            name: session.user.name || "Unknown",
            username: session.user.email?.split("@")[0] || "unknown", // Fallback username
            avatar: session.user.image || "",
          },
          visibility: payload.visibility,
          commentControl: payload.commentControl,
          attachments: [], // We can't render local images easily without object URLs, keeping empty for now or pass if available
          engagement: {
            likesCount: 0,
            commentsCount: 0,
            sharesCount: 0,
            isLiked: false,
            isShared: false,
          },
        };

        queryClient.setQueriesData<InfiniteData<PostsPage>>({ queryKey: queryKeys.feed.all }, (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                // Add to the first page
                return {
                  ...page,
                  posts: [optimisticPost, ...page.posts],
                };
              }
              return page;
            }),
          };
        });
      }

      // Return a context object with the snapshotted value
      return { previousFeed };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, newPost, context) => {
      if (context?.previousFeed) {
        queryClient.setQueriesData({ queryKey: queryKeys.feed.all }, context.previousFeed);
      }
      toast.error("Failed to create post");
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.feed.all,
      });
    },
  });
}
