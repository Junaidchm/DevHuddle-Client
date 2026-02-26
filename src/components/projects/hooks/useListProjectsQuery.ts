"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listProjects } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";

export function useListProjectsQuery(filters: { filter?: string; [key: string]: any } = {}) {
  const authHeaders = useAuthHeaders();

  return useInfiniteQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: ({ pageParam }) =>
      listProjects({ cursor: pageParam as string | undefined, limit: 12, ...filters }, authHeaders),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!authHeaders.Authorization,
  });
}
