"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getComments, getCommentCount, getCommentReplies, getCommentPreview } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { CommentListResponse } from "@/src/app/types/feed";
import { queryKeys } from "@/src/lib/queryKeys";

const COMMENTS_PAGE_SIZE = 20;

/**
 * Infinite query for comments with pagination
 */
export function useCommentsInfiniteQuery(postId: string) {
  const authHeaders = useAuthHeaders();

  return useInfiniteQuery<CommentListResponse, Error>({
    queryKey: queryKeys.engagement.comments.all(postId),
    queryFn: ({ pageParam = 0 }) =>
      getComments(
        postId,
        COMMENTS_PAGE_SIZE,
        pageParam as number,
        authHeaders
      ),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce(
        (sum, page) => sum + page.data.length,
        0
      );
      return lastPage.pagination.count > totalLoaded
        ? totalLoaded
        : undefined;
    },
    initialPageParam: 0,
    enabled: !!postId && !!authHeaders.Authorization,
    staleTime: 0, // Always refetch when component mounts to ensure fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid conflicts
  });
}

/**
 * Query for comment count
 */
export function useCommentCountQuery(postId: string) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.engagement.comments.count(postId),
    queryFn: () => getCommentCount(postId, authHeaders),
    enabled: !!postId && !!authHeaders.Authorization,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Query for comment replies (for "View X replies" functionality)
 */
export function useCommentRepliesQuery(commentId: string, enabled: boolean = false) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.engagement.comments.detail(commentId),
    queryFn: () => getCommentReplies(commentId, 10, authHeaders),
    enabled: enabled && !!commentId && !!authHeaders.Authorization,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Query for comment preview (first comment) - LinkedIn-style
 */
export function useCommentPreviewQuery(postId: string) {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.engagement.comments.preview(postId),
    queryFn: () => getCommentPreview(postId, authHeaders),
    enabled: !!postId && !!authHeaders.Authorization,
    staleTime: 30 * 1000, // 30 seconds
  });
}