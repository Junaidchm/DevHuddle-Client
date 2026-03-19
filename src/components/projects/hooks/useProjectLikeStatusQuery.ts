"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { getProjectLikeStatus } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";

/**
 * Reactively fetches whether the current user has liked a given project.
 * Uses the same query key pattern as `usePostLikeStatusQuery` for consistency.
 * This query is invalidated by:
 *  - useLikeProjectMutation (optimistic + onSuccess)
 *  - WebSocketContext on PROJECT_LIKE_UPDATE if data.userId === currentUserId
 */
export function useProjectLikeStatusQuery(projectId: string) {
  const authHeaders = useAuthHeaders();
  const { data: session } = useSession();
  const userId = session?.user?.id || "";

  return useQuery({
    queryKey: queryKeys.projects.likes.status(projectId, userId),
    queryFn: () => getProjectLikeStatus(projectId, authHeaders),
    enabled: !!projectId && !!authHeaders.Authorization && !!userId,
    staleTime: 60 * 1000, // 1 minute — invalidated immediately on like/unlike
  });
}
