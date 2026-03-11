"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getProjectComments, getProjectReplies } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";

const COMMENTS_PAGE_SIZE = 20;

/**
 * Infinite query for project comments with pagination
 */
export function useProjectCommentsInfiniteQuery(projectId: string) {
  const authHeaders = useAuthHeaders();

  return useInfiniteQuery({
    queryKey: queryKeys.projects.comments.all(projectId),
    queryFn: async ({ pageParam = 0 }) => {
      // Note: The current getProjectComments doesn't support offset/limit in project.service.ts
      // but the backend does. We'll pass it anyway if we update the service later.
      // For now, mirroring the structure.
      const comments = await getProjectComments(projectId, authHeaders);
      return {
        data: comments,
        pagination: {
          count: comments.length,
          offset: 0,
          limit: 1000,
        }
      };
    },
    getNextPageParam: (lastPage, allPages) => {
      // Logic for infinite scroll pagination
      return undefined; // Simplified for now since API returns all
    },
    initialPageParam: 0,
    enabled: !!projectId && !!authHeaders.Authorization,
  });
}

/**
 * Query for project comment count
 */
export function useProjectCommentCountQuery(projectId: string) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.projects.comments.count(projectId),
    queryFn: () => {
        // Fallback or specific count API
        return getProjectComments(projectId, authHeaders).then(res => res.length);
    },
    enabled: !!projectId && !!authHeaders.Authorization,
    staleTime: 60 * 1000,
  });
}

/**
 * Query for project comment replies
 */
export function useProjectCommentRepliesQuery(commentId: string, enabled: boolean = false) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.projects.comments.replies(commentId),
    queryFn: () => getProjectReplies(commentId, authHeaders),
    enabled: enabled && !!commentId && !!authHeaders.Authorization,
    staleTime: 30 * 1000,
  });
}
