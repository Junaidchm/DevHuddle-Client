"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getTrendingProjects, ListProjectsResponse } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

export function useTrendingProjectsQuery(period?: string) {
  const authHeaders = useAuthHeaders();

  return useInfiniteQuery<ListProjectsResponse>({
    queryKey: ["projects", "trending", period],
    queryFn: async ({ pageParam }) => {
      return await getTrendingProjects(
        {
          cursor: pageParam as string | null,
          period,
          limit: 10,
        },
        authHeaders
      );
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    initialPageParam: null as string | null,
    enabled: true, // Always enabled - these are public routes
    staleTime: 60 * 1000, // 1 minute
  });
}

