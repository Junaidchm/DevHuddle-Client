"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProjectComment,
  updateProjectComment,
  deleteProjectComment,
  getProjectComments,
  getProjectReplies,
  ProjectComment,
} from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/lib/queryKeys";

/**
 * Hook for fetching project comments
 */
export function useProjectCommentsQuery(projectId: string) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.projects.comments.all(projectId),
    queryFn: () => getProjectComments(projectId, authHeaders),
    enabled: !!projectId,
  });
}

/**
 * Hook for fetching project comment replies
 */
export function useProjectRepliesQuery(commentId: string) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.projects.comments.replies(commentId),
    queryFn: () => getProjectReplies(commentId, authHeaders),
    enabled: !!commentId,
  });
}

/**
 * Hook for project comment mutations (create, update, delete)
 */
export function useProjectCommentMutations(projectId: string) {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();
  const { data: session } = useSession();

  // Create Comment
  const createCommentMutation = useMutation({
    mutationFn: ({ content, parentCommentId }: { content: string; parentCommentId?: string }) =>
      createProjectComment(projectId, content, authHeaders, parentCommentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.comments.all(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.comments.count(projectId) });
      // Also invalidate project detail to update comment count
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
    onError: () => {
      toast.error("Failed to post comment");
    },
  });

  // Update Comment
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateProjectComment(commentId, content, authHeaders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.comments.all(projectId) });
    },
    onError: () => {
      toast.error("Failed to update comment");
    },
  });

  // Delete Comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteProjectComment(commentId, authHeaders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.comments.all(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.comments.count(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  return {
    createComment: createCommentMutation,
    updateComment: updateCommentMutation,
    deleteComment: deleteCommentMutation,
  };
}
