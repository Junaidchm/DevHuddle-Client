"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportProject } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";

export function useReportProjectMutation(projectId: string) {
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: ({ reason, description }: { reason: string; description?: string }) =>
      reportProject(
        projectId, 
        reason, 
        description ? JSON.stringify({ description }) : undefined, 
        authHeaders
      ),
    onSuccess: () => {
      toast.success("Project reported successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to report project");
    },
  });
}
