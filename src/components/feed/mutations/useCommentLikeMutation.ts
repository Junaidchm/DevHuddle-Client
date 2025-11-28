"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeComment, unlikeComment } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { InfiniteData } from "@tanstack/react-query";
import { Comment } from "@/src/app/types/feed";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { queryKeys } from "@/src/lib/queryKeys";

/**
 * Like/Unlike Comment Mutation Hook
 * 
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Recursive cache updates for nested replies
 * - Automatic cache invalidation
 * - Idempotency key support
 * - Error handling with rollback
 */
export function useCommentLikeMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  // Helper: Recursively update comment in tree
  const updateCommentInTree = (
    comments: Comment[],
    commentId: string,
    updateFn: (comment: Comment) => Comment
  ): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return updateFn(comment);
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updateFn),
        };
      }
      return comment;
    });
  };

  return useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
      postId,
    }: {
      commentId: string;
      isLiked: boolean;
      postId: string;
    }) => {
      const idempotencyKey = uuidv4();
      if (isLiked) {
        return await unlikeComment(commentId, authHeaders);
      } else {
        return await likeComment(commentId, authHeaders);
      }
    },
    onMutate: async ({ commentId, isLiked, postId }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.engagement.comments.all(postId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.engagement.comments.preview(postId),
      });

      // Snapshot previous data for rollback
      const previousPreview = queryClient.getQueryData(
        queryKeys.engagement.comments.preview(postId)
      );
      const previousComments = queryClient.getQueriesData({
        queryKey: queryKeys.engagement.comments.all(postId),
      });

      // Update preview query
      queryClient.setQueryData(
        queryKeys.engagement.comments.preview(postId),
        (old: any) => {
          if (!old?.data?.comment) return old;
          if (old.data.comment.id === commentId) {
            return {
              ...old,
              data: {
                ...old.data,
                comment: {
                  ...old.data.comment,
                  likesCount: isLiked
                    ? Math.max(0, old.data.comment.likesCount - 1)
                    : old.data.comment.likesCount + 1,
                  isLiked: !isLiked,
                },
              },
            };
          }
          // Check replies in preview
          if (old.data.comment.replies) {
            const updatedReplies = old.data.comment.replies.map((reply: Comment) =>
              reply.id === commentId
                ? {
                    ...reply,
                    likesCount: isLiked
                      ? Math.max(0, reply.likesCount - 1)
                      : reply.likesCount + 1,
                    isLiked: !isLiked,
                  }
                : reply
            );
            return {
              ...old,
              data: {
                ...old.data,
                comment: {
                  ...old.data.comment,
                  replies: updatedReplies,
                },
              },
            };
          }
          return old;
        }
      );

      // Optimistically update comment in all comment queries (recursively)
      queryClient.setQueriesData<
        InfiniteData<{ data: Comment[]; pagination: any }>
      >(
        { queryKey: queryKeys.engagement.comments.all(postId) },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: updateCommentInTree(page.data, commentId, (comment) => ({
                ...comment,
                likesCount: isLiked
                  ? Math.max(0, comment.likesCount - 1)
                  : comment.likesCount + 1,
                isLiked: !isLiked,
              })),
            })),
          };
        }
      );

      // Update like count query
      queryClient.setQueryData(
        queryKeys.engagement.commentLikes.count(commentId),
        (old: { success: boolean; count: number } | undefined) => {
          const currentCount = old?.count || 0;
          return {
            success: true,
            count: isLiked
              ? Math.max(0, currentCount - 1)
              : currentCount + 1,
          };
        }
      );

      // Update like status query
      queryClient.setQueryData(
        queryKeys.engagement.commentLikes.status(commentId, ""),
        { success: true, isLiked: !isLiked }
      );

      return { previousPreview, previousComments, postId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.postId) {
        if (context.previousPreview) {
          queryClient.setQueryData(
            queryKeys.engagement.comments.preview(context.postId),
            context.previousPreview
          );
        }
        if (context.previousComments) {
          context.previousComments.forEach(([queryKey, data]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
      }

      toast.error(
        variables.isLiked
          ? "Failed to unlike comment. Please try again."
          : "Failed to like comment. Please try again."
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate to refetch fresh data (but keep optimistic update visible)
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments.all(variables.postId),
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.comments.preview(variables.postId),
        refetchType: "none",
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.commentLikes.count(variables.commentId),
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.commentLikes.status(
          variables.commentId,
          ""
        ),
      });
    },
  });
}

