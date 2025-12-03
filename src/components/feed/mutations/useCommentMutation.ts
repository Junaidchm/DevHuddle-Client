"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  updateComment,
  deleteComment,
} from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useSession } from "next-auth/react";
import { InfiniteData } from "@tanstack/react-query";
import { Comment, PostsPage, PostEngagement } from "@/src/app/types/feed";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { queryKeys } from "@/src/lib/queryKeys";

/**
 * Create Comment Mutation Hook
 */
export function useCreateCommentMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      parentCommentId,
    }: {
      postId: string;
      content: string;
      parentCommentId?: string;
    }) => {
      const idempotencyKey = uuidv4();
      return await createComment(
        postId,
        content,
        authHeaders,
        parentCommentId,
        idempotencyKey
      );
    },
    onMutate: async ({ postId, content, parentCommentId }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.engagement.comments.all(postId),
      });

      // Snapshot previous data for rollback
      const previousComments = queryClient.getQueryData<
        InfiniteData<{ data: Comment[]; pagination: any }>
      >(queryKeys.engagement.comments.all(postId));

      // Optimistically update comment count in feed
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
                  const currentCount = post?.engagement?.commentsCount || 0;
                  return {
                    ...post,
                    engagement: {
                      ...post.engagement,
                      commentsCount: currentCount + 1,
                    } as PostEngagement,
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      // Update comment count query
      queryClient.setQueryData(
        queryKeys.engagement.comments.count(postId),
        (old: { success: boolean; count: number } | undefined) => {
          const currentCount = old?.count || 0;
          return {
            success: true,
            count: currentCount + 1,
          };
        }
      );

      return { previousComments };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.engagement.comments.all(variables.postId),
          context.previousComments
        );
      }

      toast.error("Failed to create comment. Please try again.");
    },
    onSuccess: (data, variables) => {
      // Invalidate comments query to refetch with new comment
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments.all(variables.postId),
      });

      // Invalidate comment count
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments.count(variables.postId),
      });

      // Invalidate feed to update comment count
      queryClient.invalidateQueries({
        queryKey: ["post-feed"],
        refetchType: "none",
      });

      // ✅ FIXED: Invalidate notifications to ensure new comment notifications appear instantly
      // (WebSocket should handle this, but this is a backup)
      if (session?.user?.id) {
        queryClient.invalidateQueries({
          queryKey: ["notifications", session.user.id],
          refetchType: "none", // Don't refetch immediately, let WebSocket handle it
        });
      }
    },
  });
}

/**
 * Update Comment Mutation Hook
 */
export function useUpdateCommentMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
      postId,
    }: {
      commentId: string;
      content: string;
      postId: string;
    }) => {
      const idempotencyKey = uuidv4();
      return await updateComment(commentId, content, authHeaders, idempotencyKey);
    },
    onMutate: async ({ commentId, content, postId }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.engagement.comments.all(postId),
      });

      // Snapshot previous data
      const previousComments = queryClient.getQueryData<
        InfiniteData<{ data: Comment[]; pagination: any }>
      >(queryKeys.engagement.comments.all(postId));

      // Helper: Update comment in flat structure (main comments + one level of replies)
      const updateCommentFlat = (
        comments: Comment[],
        targetId: string,
        updateFn: (comment: Comment) => Comment
      ): Comment[] => {
        return comments.map((comment) => {
          // Check if this is the main comment
          if (comment.id === targetId) {
            return updateFn(comment);
          }
          // Check replies (one level only - LinkedIn-style flat structure)
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === targetId ? updateFn(reply) : reply
              ),
            };
          }
          return comment;
        });
      };

      // Optimistically update comment in the specific post's comment query (flat structure)
      queryClient.setQueriesData<InfiniteData<{ data: Comment[]; pagination: any }>>(
        { queryKey: queryKeys.engagement.comments.all(postId) },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: updateCommentFlat(page.data, commentId, (comment) => ({
                ...comment,
                content,
                editedAt: new Date().toISOString(),
              })),
            })),
          };
        }
      );

      return { previousComments };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.engagement.comments.all(variables.postId),
          context.previousComments
        );
      }

      toast.error("Failed to update comment. Please try again.");
    },
    onSuccess: (data, variables) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments.all(variables.postId),
      });
    },
  });
}

/**
 * Delete Comment Mutation Hook
 */
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({ commentId, postId }: { commentId: string; postId: string }) => {
      const idempotencyKey = uuidv4();
      return await deleteComment(commentId, authHeaders, idempotencyKey);
    },
    onMutate: async ({ commentId, postId }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.engagement.comments.all(postId),
      });

      // Snapshot previous data
      const previousComments = queryClient.getQueryData<
        InfiniteData<{ data: Comment[]; pagination: any }>
      >(queryKeys.engagement.comments.all(postId));

      // Helper: Remove comment from flat structure (main comments + one level of replies)
      const removeCommentFlat = (
        comments: Comment[],
        targetId: string
      ): Comment[] => {
        return comments
          .filter((comment) => comment.id !== targetId)
          .map((comment) => {
            // Remove from replies if it's a reply (one level only - LinkedIn-style flat structure)
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.filter((reply) => reply.id !== targetId),
              };
            }
            return comment;
          });
      };

      // Optimistically remove comment from list (flat structure)
      queryClient.setQueriesData<InfiniteData<{ data: Comment[]; pagination: any }>>(
        { queryKey: queryKeys.engagement.comments.all(postId) },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: removeCommentFlat(page.data, commentId),
            })),
          };
        }
      );

      // Optimistically update comment count in feed
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
                  const currentCount = post?.engagement?.commentsCount || 0;
                  return {
                    ...post,
                    engagement: {
                      ...post.engagement,
                      commentsCount: Math.max(0, currentCount - 1),
                    } as PostEngagement,
                  };
                }
                return post;
              }),
            })),
          };
        }
      );

      // Update comment count query
      queryClient.setQueryData(
        queryKeys.engagement.comments.count(postId),
        (old: { success: boolean; count: number } | undefined) => {
          const currentCount = old?.count || 0;
          return {
            success: true,
            count: Math.max(0, currentCount - 1),
          };
        }
      );

      return { previousComments };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.engagement.comments.all(variables.postId),
          context.previousComments
        );
      }

      toast.error("Failed to delete comment. Please try again.");
    },
    onSuccess: (data, variables) => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments.all(variables.postId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments.count(variables.postId),
      });

      queryClient.invalidateQueries({
        queryKey: ["post-feed"],
        refetchType: "none",
      });
    },
  });
}