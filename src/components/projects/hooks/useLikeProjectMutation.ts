"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeProject, unlikeProject } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/src/lib/queryKeys";
import toast from "react-hot-toast";

/**
 * Like/Unlike Project Mutation Hook
 *
 * Features:
 * - Optimistic updates for instant UI feedback (count + status)
 * - Automatic cache invalidation on success
 * - Error handling with rollback
 * - Multi-session synchronization: only updates the initiating user's status
 */
export function useLikeProjectMutation(projectId: string) {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();
  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await likeProject(projectId, authHeaders);
    },
    onMutate: async () => {
      // Cancel any in-flight queries that might overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: queryKeys.engagement.postLikes.count(projectId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.likes.status(projectId, userId),
      });

      // Snapshot previous values for rollback
      const previousCount = queryClient.getQueryData<{ success: boolean; count: number }>(
        queryKeys.engagement.postLikes.count(projectId)
      );
      const previousStatus = queryClient.getQueryData<{ success: boolean; isLiked: boolean }>(
        queryKeys.projects.likes.status(projectId, userId)
      );

      // Optimistically update count
      queryClient.setQueryData(
        queryKeys.engagement.postLikes.count(projectId),
        (old: { success: boolean; count: number } | undefined) => ({
          success: true,
          count: (old?.count ?? 0) + 1,
        })
      );

      // Optimistically update like status for this user
      queryClient.setQueryData(queryKeys.projects.likes.status(projectId, userId), {
        success: true,
        isLiked: true,
      });

      return { previousCount, previousStatus };
    },
    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          queryKeys.engagement.postLikes.count(projectId),
          context.previousCount
        );
      }
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          queryKeys.projects.likes.status(projectId, userId),
          context.previousStatus
        );
      }
      toast.error("Failed to like project. Please try again.");
    },
    onSuccess: () => {
      // Invalidate to sync with server truth
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.postLikes.count(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.likes.status(projectId, userId),
      });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: async () => {
      return await unlikeProject(projectId, authHeaders);
    },
    onMutate: async () => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({
        queryKey: queryKeys.engagement.postLikes.count(projectId),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.likes.status(projectId, userId),
      });

      // Snapshot previous values
      const previousCount = queryClient.getQueryData<{ success: boolean; count: number }>(
        queryKeys.engagement.postLikes.count(projectId)
      );
      const previousStatus = queryClient.getQueryData<{ success: boolean; isLiked: boolean }>(
        queryKeys.projects.likes.status(projectId, userId)
      );

      // Optimistically update count
      queryClient.setQueryData(
        queryKeys.engagement.postLikes.count(projectId),
        (old: { success: boolean; count: number } | undefined) => ({
          success: true,
          count: Math.max(0, (old?.count ?? 1) - 1),
        })
      );

      // Optimistically update like status
      queryClient.setQueryData(queryKeys.projects.likes.status(projectId, userId), {
        success: true,
        isLiked: false,
      });

      return { previousCount, previousStatus };
    },
    onError: (_err, _vars, context) => {
      // Rollback
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(
          queryKeys.engagement.postLikes.count(projectId),
          context.previousCount
        );
      }
      if (context?.previousStatus !== undefined) {
        queryClient.setQueryData(
          queryKeys.projects.likes.status(projectId, userId),
          context.previousStatus
        );
      }
      toast.error("Failed to unlike project. Please try again.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.engagement.postLikes.count(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.likes.status(projectId, userId),
      });
    },
  });

  return {
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    isLiking: likeMutation.isPending,
    isUnliking: unlikeMutation.isPending,
  };
}
