"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeProject, unlikeProject } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";

export function useLikeProjectMutation(projectId: string) {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await likeProject(projectId, authHeaders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: async () => {
      return await unlikeProject(projectId, authHeaders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return {
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    isLiking: likeMutation.isPending,
    isUnliking: unlikeMutation.isPending,
  };
}

