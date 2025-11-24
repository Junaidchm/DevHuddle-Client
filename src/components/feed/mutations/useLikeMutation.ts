"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { InfiniteData } from "@tanstack/react-query";
import { PostsPage, NewPost, PostEngagement } from "@/src/app/types/feed";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { queryKeys } from "@/src/lib/queryKeys";

/**
 * Like/Unlike Post Mutation Hook
 * 
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Automatic cache invalidation
 * - Idempotency key support
 * - Error handling with rollback
 */
export function useLikeMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      const idempotencyKey = uuidv4();
      if (isLiked) {
        return await unlikePost(postId, authHeaders, idempotencyKey);
      } else {
        return await likePost(postId, authHeaders, idempotencyKey);
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ["post-feed"] });

      // Snapshot previous data for rollback
      const previousFeedData = queryClient.getQueryData<
        InfiniteData<PostsPage, string | null>
      >(["post-feed", "for-you"]);

      // Optimistically update the feed cache
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        { queryKey: ["post-feed"] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === postId) {
                  const currentLikes = post?.engagement?.likesCount || 0;
                  return {
                    ...post,
                    engagement: {
                      ...post.engagement,
                      likesCount: isLiked
                        ? Math.max(0, currentLikes - 1)
                        : currentLikes + 1,
                      isLiked: !isLiked,
                    } as PostEngagement,
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      // Update like status query
      queryClient.setQueryData(
        queryKeys.engagement.postLikes.status(postId, ""), // userId not needed for cache
        { success: true, isLiked: !isLiked }
      );

      // Update like count query
      queryClient.setQueryData(
        queryKeys.engagement.postLikes.count(postId),
        (old: { success: boolean; count: number } | undefined) => {
          const currentCount = old?.count || 0;
          return {
            success: true,
            count: isLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
          };
        }
      );

      return { previousFeedData };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousFeedData) {
        queryClient.setQueryData(
          ["post-feed", "for-you"],
          context.previousFeedData
        );
      }

      toast.error(
        variables.isLiked
          ? "Failed to unlike post. Please try again."
          : "Failed to like post. Please try again."
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.postLikes.count(variables.postId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.postLikes.status(variables.postId, ""),
      });

      toast.success(
        variables.isLiked ? "Post unliked" : "Post liked"
      );
    },
  });
}