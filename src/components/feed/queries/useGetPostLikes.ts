"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getPostLikes } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";

const LIKES_PAGE_SIZE = 10;

/**
 * Infinite query for post likes with pagination
 */
export function useGetPostLikes(postId: string) {
  const authHeaders = useAuthHeaders();

  return useInfiniteQuery({
    queryKey: queryKeys.engagement.postLikes.list(postId),
    queryFn: async ({ pageParam = 1 }) => {
      return getPostLikes(postId, LIKES_PAGE_SIZE, pageParam as number, authHeaders);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!postId && !!authHeaders.Authorization,
    staleTime: 0, // Always refetch to ensure fresh data for likes modal
  });
}
