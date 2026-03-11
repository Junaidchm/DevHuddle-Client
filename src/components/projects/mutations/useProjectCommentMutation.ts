"use client";

import { useMutation, useQueryClient, InfiniteData } from "@tanstack/react-query";
import {
  createProjectComment,
  updateProjectComment,
  deleteProjectComment,
  ProjectComment
} from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/lib/queryKeys";

/**
 * Create Project Comment Mutation
 */
export function useCreateProjectCommentMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({
      projectId,
      content,
      parentCommentId,
    }: {
      projectId: string;
      content: string;
      parentCommentId?: string;
    }) => {
      return await createProjectComment(
        projectId,
        content,
        authHeaders,
        parentCommentId
      );
    },
    onMutate: async ({ projectId }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.projects.comments.all(projectId),
      });

      const previousComments = queryClient.getQueryData(
        queryKeys.projects.comments.all(projectId)
      );

      // Update count query optimistically
      queryClient.setQueryData(
        queryKeys.projects.comments.count(projectId),
        (old: number | undefined) => (old || 0) + 1
      );

      return { previousComments };
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.projects.comments.all(variables.projectId),
          context.previousComments
        );
      }
      toast.error("Failed to post comment");
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments.all(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments.count(variables.projectId),
      });
      // Also invalidate project detail to refresh counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.projectId),
      });
    },
  });
}

/**
 * Update Project Comment Mutation
 */
export function useUpdateProjectCommentMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
      projectId,
    }: {
      commentId: string;
      content: string;
      projectId: string;
    }) => {
      return await updateProjectComment(commentId, content, authHeaders);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments.all(variables.projectId),
      });
    },
    onError: () => {
      toast.error("Failed to update comment");
    }
  });
}

/**
 * Delete Project Comment Mutation
 */
export function useDeleteProjectCommentMutation() {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async ({ commentId, projectId }: { commentId: string; projectId: string }) => {
      return await deleteProjectComment(commentId, authHeaders);
    },
    onMutate: async ({ projectId }) => {
      queryClient.setQueryData(
        queryKeys.projects.comments.count(projectId),
        (old: number | undefined) => Math.max(0, (old || 0) - 1)
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments.all(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.comments.count(variables.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.projectId),
      });
    },
    onError: () => {
      toast.error("Failed to delete comment");
    }
  });
}
