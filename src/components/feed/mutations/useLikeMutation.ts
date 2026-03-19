"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, unlikePost } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();

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
      await queryClient.cancelQueries({ queryKey: queryKeys.feed.all });

      // Snapshot previous data for rollback
      const previousFeedData = queryClient.getQueryData<
        InfiniteData<PostsPage, string | null>
      >(queryKeys.feed.list({ sortBy: "RECENT" })); // Fallback snaphot if for-you is missing

      // Optimistically update the feed cache
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        { queryKey: queryKeys.feed.all },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              posts: page.posts.map((post) => {
                if (post.id === postId) {
                  const currentLikes = post?.engagement?.likesCount || 0;
                  const currentIsLiked = post?.engagement?.isLiked || false;
                  
                  return {
                    ...post,
                    engagement: {
                      ...post.engagement,
                      likesCount: isLiked
                        ? Math.max(0, currentLikes - 1)
                        : currentLikes + 1,
                      isLiked: !isLiked,
                      // Preserve other engagement fields
                      commentsCount: post?.engagement?.commentsCount || 0,
                      sharesCount: post?.engagement?.sharesCount || 0,
                      isShared: post?.engagement?.isShared || false,
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
        queryKeys.engagement.postLikes.status(postId, session?.user?.id || ""),
        { success: true, isLiked: !isLiked }
      );

      // Update like count query
      // IMPORTANT: `old` is undefined when the query hasn't fetched yet (staleTime: 60s).
      // In that case, read the real count from the already-loaded feed cache so we never reset to 0.
      queryClient.setQueryData(
        queryKeys.engagement.postLikes.count(postId),
        (old: { success: boolean; count: number } | undefined) => {
          let currentCount = old?.count;

          // If per-post count query has no cached data yet, search ALL feed caches
          // to find the real count (works for RECENT, FOR_YOU, user feeds, etc.)
          if (currentCount === undefined) {
            const allFeedQueries = queryClient.getQueriesData<InfiniteData<PostsPage, string | null>>(
              { queryKey: queryKeys.feed.all }
            );
            for (const [, feedData] of allFeedQueries) {
              const foundPost = feedData?.pages
                ?.flatMap((p) => p.posts)
                ?.find((p) => p.id === postId);
              if (foundPost?.engagement?.likesCount !== undefined) {
                currentCount = foundPost.engagement.likesCount;
                break;
              }
            }
            currentCount = currentCount ?? 0;
          }

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
        queryClient.setQueriesData(
          { queryKey: queryKeys.feed.all },
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
      // Invalidate to refetch fresh data (but keep optimistic update visible)
      queryClient.invalidateQueries({
        queryKey: queryKeys.feed.all,
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.postLikes.count(variables.postId),
      });
      
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.postLikes.status(variables.postId, session?.user?.id || ""),
      });
 
      // Invalidate likes list to ensure modal shows updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.postLikes.list(variables.postId),
      });
 
      // ✅ FIXED: Invalidate notifications to ensure new like notifications appear instantly
      // (WebSocket should handle this, but this is a backup)
      if (session?.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["notifications", session.user.id],
        });
      }

      // Don't show toast on success (optional - remove if you want to keep it)
      // toast.success(
      //   variables.isLiked ? "Post unliked" : "Post liked"
      // );
    },
  });
}