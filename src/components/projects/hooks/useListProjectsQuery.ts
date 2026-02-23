"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listProjects } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";

export function useListProjectsQuery(filters: { myProjects?: boolean } = {}) {
  const authHeaders = useAuthHeaders();

  return useInfiniteQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: ({ pageParam = null }) =>
      listProjects({ cursor: pageParam as string | null, limit: 12, ...filters }, authHeaders),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!authHeaders.Authorization,
  });
}
