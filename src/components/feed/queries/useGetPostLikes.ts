"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getPostLikes, getPostLikeCount, getPostShareLink, getProjectLikeCount } from "@/src/services/api/engagement.service";
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
/**
 * Query for post like count
 */
export function usePostLikeCountQuery(postId: string, isProject: boolean = false) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.engagement.postLikes.count(postId),
    queryFn: () => isProject ? getProjectLikeCount(postId, authHeaders) : getPostLikeCount(postId, authHeaders),
    enabled: !!postId && !!authHeaders.Authorization,
    staleTime: 60 * 1000,
  });
}
