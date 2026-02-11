"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { getMessages } from "@/src/services/api/chat.service";
import { queryKeys } from "@/src/lib/queryKeys";
import { Message } from "@/src/types/chat.types";

/**
 * Real-Time Messages Hook
 * Fetches messages for a conversation and auto-updates via WebSocket
 */
export function useMessages(conversationId: string | null) {
  const authHeaders = useAuthHeaders();

  const queryResult = useInfiniteQuery({
    queryKey: conversationId ? queryKeys.chat.messages.list(conversationId) : [],
    queryFn: async ({ pageParam }) => {
      if (!conversationId || !authHeaders.Authorization) return { messages: [], hasMore: false, total: 0 };

      // pageParam is undefined for first page, or a Date string for subsequent pages
      const beforeCursor = pageParam ? new Date(pageParam as string) : undefined;

      const response = await getMessages(
        conversationId,
        authHeaders,
        50, // limit per page
        beforeCursor
      );
      
      // Normalize response: Backend returns { data: [], pagination: {} }
      // InfiniteQuery expects us to return the whole response object usually, 
      // but we need to ensure the `messages` property exists if we access it later,
      // or we adjust how access happens.
      // Let's return a normalized object that matches what we expect
      return {
          messages: response.data || response.messages || [],
          pagination: response.pagination,
          hasMore: response.pagination ? response.pagination.count >= response.pagination.limit : (response.hasMore || false),
          total: response.pagination?.count || (response as any).total || 0 
      };
    },
    getNextPageParam: (lastPage) => {
        // If no messages or hasMore is false (though backend might not send hasMore in cursor mode correctly yet), stop.
        // Better: If we got fewer messages than limit, we are done.
        // OR: Backend sends `nextCursor` or we preserve `hasMore`.
        // Let's rely on message count for now or if we add nextCursor to response.
        if (!lastPage.messages || lastPage.messages.length < 50) return undefined;
        
        // Use the oldest message (last in the list because it's ordered DESC) as the cursor for next fetch
        const oldestMessage = lastPage.messages[lastPage.messages.length - 1];
        return oldestMessage.createdAt; // Return ISO string
    },
    enabled: !!conversationId && !!authHeaders.Authorization,
    staleTime: 30000,
    refetchOnWindowFocus: false, // WebSocket handles updates
    initialPageParam: undefined as string | undefined, // Explicit type
  });

  // Flatten messages from all pages and filter out any undefined items
  const messages = queryResult.data?.pages.flatMap(page => page?.messages || []) || [];

  return {
    ...queryResult,
    data: messages.reverse(), // Chat usually displays oldest at top (stored reversed in backend?) or handling in UI
    // If backend returns newest first (standard for chat APIs), we might need to reverse for display if UI stacks bottom-up. 
    // Usually ChatWindow expects chronological order (Old -> New). 
    // Assuming backend returns Newest -> Oldest for pagination efficiency. 
    // If so, reverse here.
  };
}
