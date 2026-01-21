"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { checkConversationExists, createConversation } from '@/src/services/api/chat.service';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { queryKeys } from '@/src/lib/queryKeys';
import { toast } from 'sonner';

/**
 * Hook to create a new conversation with duplicate checking
 * Automatically checks if conversation exists before creating
 * Navigates to conversation on success
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const authHeaders = useAuthHeaders();

  return useMutation({
    mutationFn: async (participantIds: string[]) => {
      // First, check if conversation already exists
      const checkResult = await checkConversationExists(participantIds, authHeaders);
      
      if (checkResult.data.exists && checkResult.data.conversationId) {
        // Conversation exists, return existing ID
        return {
          conversationId: checkResult.data.conversationId,
          isNew: false,
        };
      }

      // Conversation doesn't exist, create new one
      const createResult = await createConversation(participantIds, authHeaders);
      return {
        conversationId: createResult.data.id,
        isNew: true,
      };
    },
    onSuccess: ({ conversationId, isNew }) => {
      // Invalidate conversations cache to refetch updated list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chat.conversations.list() 
      });

      // Show appropriate toast
      if (isNew) {
        toast.success('Conversation created!');
      } else {
        toast.info('Opening existing conversation...');
      }

      // Navigate to the conversation
      router.push(`/chat/${conversationId}`);
    },
    onError: (error: any) => {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    },
  });
}
