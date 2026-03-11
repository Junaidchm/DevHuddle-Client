"use client";

import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import {
  likeProjectComment,
  unlikeProjectComment,
  ProjectComment
} from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";
import toast from "react-hot-toast";

/**
 * Project Comment Like Mutation Hook
 */
export function useProjectCommentLikeMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
    }: {
      commentId: string;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        return await unlikeProjectComment(commentId, authHeaders);
      } else {
        return await likeProjectComment(commentId, authHeaders);
      }
    },
    onMutate: async ({ commentId, isLiked }) => {
      // Find which projectId this comment belongs to by searching the cache
      // This is a bit complex for project comments since queryKey includes projectId
      // In a real app, we might pass projectId to the mutation or have a flatter cache
      
      // For now, we'll invalidate all project comment queries or require projectId as input
      // Let's assume we pass projectId for better cache management
    },
    onSuccess: (data, variables) => {
      // Logic handled by the component or by invalidating specific project comments
    },
    onError: () => {
      toast.error("Failed to update reaction");
    }
  });
}

/**
 * Enhanced Like Mutation that supports optimistic updates if projectId is provided
 */
export function useProjectCommentLikeOptimisticMutation(projectId: string) {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      commentId,
      isLiked,
    }: {
      commentId: string;
      isLiked: boolean;
    }) => {
      if (isLiked) {
        return await unlikeProjectComment(commentId, authHeaders);
      } else {
        return await likeProjectComment(commentId, authHeaders);
      }
    },
    onMutate: async ({ commentId, isLiked }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.comments.all(projectId),
      });

      const previousComments = queryClient.getQueryData(
        queryKeys.projects.comments.all(projectId)
      );

      // Optimistically update the comment in the list
      queryClient.setQueriesData(
        { queryKey: queryKeys.projects.comments.all(projectId) },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((comment: ProjectComment) => {
                if (comment.id === commentId) {
                  return {
                    ...comment,
                    isLiked: !isLiked,
                    likesCount: comment.likesCount + (isLiked ? -1 : 1),
                  };
                }
                // Check replies
                if (comment.replies) {
                  return {
                    ...comment,
                    replies: comment.replies.map((reply: ProjectComment) =>
                      reply.id === commentId
                        ? {
                            ...reply,
                            isLiked: !isLiked,
                            likesCount: reply.likesCount + (isLiked ? -1 : 1),
                          }
                        : reply
                    ),
                  };
                }
                return comment;
              }),
            })),
          };
        }
      );

      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.projects.comments.all(projectId),
          context.previousComments
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments.all(projectId),
      });
    },
  });
}
