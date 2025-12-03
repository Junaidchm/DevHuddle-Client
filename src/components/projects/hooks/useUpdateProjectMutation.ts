"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProject, UpdateProjectData } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";

export function useUpdateProjectMutation(projectId: string) {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async (data: UpdateProjectData) => {
      return await updateProject(projectId, data, authHeaders);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}

