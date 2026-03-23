"use client";

import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";

export function useListProjectsQuery(params: { myProjects?: boolean, page?: number, limit?: number } = {}) {
  const authHeaders = useAuthHeaders();
  const { page = 1, limit = 12, ...filters } = params;

  return useQuery({
    queryKey: queryKeys.projects.list({ ...filters, page, limit }),
    queryFn: () =>
      listProjects({ page, limit, ...filters }, authHeaders),
    enabled: !!authHeaders.Authorization,
  });
}
