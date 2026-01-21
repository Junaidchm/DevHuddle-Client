"use client";

import { useInfiniteQuery } from '@tanstack/react-query';
import { getConversations } from '@/src/services/api/chat.service';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { queryKeys } from '@/src/lib/queryKeys';

/**
 * Hook to fetch conversations with infinite scroll support
 * Automatically handles pagination and caching
 */
export function useConversations() {
  const authHeaders = useAuthHeaders();

  return useInfiniteQuery({
    queryKey: queryKeys.chat.conversations.list(),
    queryFn: ({ pageParam = 0 }) => {
      return getConversations(authHeaders, 20, pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length < 20) {
        return undefined;
      }
      return allPages.length * 20;
    },
    initialPageParam: 0,
    enabled: !!authHeaders.Authorization, 
    staleTime: 30000, 
  });
}
