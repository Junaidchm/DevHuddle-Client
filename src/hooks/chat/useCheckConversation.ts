"use client";

import { useMutation } from '@tanstack/react-query';
import { checkConversationExists } from '@/src/services/api/chat.service';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { CheckConversationResponse } from '@/src/types/chat.types';

/**
 * Hook to check if a conversation exists without creating it
 * Useful for standalone duplicate detection
 */
export function useCheckConversation() {
  const authHeaders = useAuthHeaders();
  const token = authHeaders.Authorization?.replace('Bearer ', '') || '';

  return useMutation<CheckConversationResponse, Error, string[]>({
    mutationFn: (participantIds: string[]) => {
      return checkConversationExists(token, participantIds);
    },
  });
}
