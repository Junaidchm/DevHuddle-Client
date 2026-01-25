"use client";

import { useQuery } from "@tanstack/react-query";
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

  return useQuery<Message[]>({
    queryKey: conversationId ? queryKeys.chat.messages.list(conversationId) : [],
    queryFn: async () => {
      if (!conversationId || !authHeaders.Authorization) return [];

      const response = await getMessages(
        conversationId,
        authHeaders,
        100 // limit
      );

      return response.messages || [];
    },
    enabled: !!conversationId && !!authHeaders.Authorization,
    staleTime: 30000,
    refetchOnWindowFocus: false, // WebSocket handles updates
  });
}
