"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shareProject } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/lib/queryKeys";

export function useShareProjectMutation(projectId: string) {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: (data: { shareType: string; caption?: string }) => 
      shareProject(projectId, data, authHeaders),
    onSuccess: (data) => {
      toast.success("Project shared successfully");
      // Optionally update project cache with new sharesCount
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to share project");
    },
  });
}
