"use client";

import { useQuery } from "@tanstack/react-query";
import { getTrendingProjects, ListProjectsResponse } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

export function useTrendingProjectsQuery(period?: string, page: number = 1, limit: number = 10) {
  const authHeaders = useAuthHeaders();

  return useQuery<ListProjectsResponse>({
    queryKey: ["projects", "trending", period, page, limit],
    queryFn: async () => {
      return await getTrendingProjects(
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

