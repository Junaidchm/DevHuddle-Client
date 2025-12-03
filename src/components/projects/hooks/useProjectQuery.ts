"use client";

import { useQuery } from "@tanstack/react-query";
import { getProject, Project } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

export function useProjectQuery(projectId: string, enabled: boolean = true) {
  const authHeaders = useAuthHeaders();

  return useQuery<Project>({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      return await getProject(projectId, authHeaders);
    },
    enabled: enabled && !!projectId && !!authHeaders.Authorization,
    staleTime: 30 * 1000, // 30 seconds
  });
}

