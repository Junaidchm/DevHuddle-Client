"use client";

import { useQuery } from "@tanstack/react-query";
import { getTopProjects, ListProjectsResponse } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

export function useTopProjectsQuery(period?: string, page: number = 1, limit: number = 10) {
  const authHeaders = useAuthHeaders();

  return useQuery<ListProjectsResponse>({
    queryKey: ["projects", "top", period, page, limit],
    queryFn: async () => {
      return await getTopProjects(
        {
          page,
          period,
          limit,
        },
        authHeaders
      );
    },
    enabled: true, // Always enabled - these are public routes
    staleTime: 60 * 1000, // 1 minute
  });
}

