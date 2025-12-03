"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shareProject } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";

export function useShareProjectMutation(projectId: string) {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async (data: { caption?: string; shareType?: string }) => {
      return await shareProject(projectId, data, authHeaders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project shared successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to share project");
    },
  });
}

