"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkConversationExists, createConversation } from '@/src/services/api/chat.service';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { queryKeys } from '@/src/lib/queryKeys';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import type { InfiniteData } from '@tanstack/react-query';
import type { GetConversationsResponse, ConversationWithMetadata } from '@/src/types/chat.types';

/**
 * Hook to create a new conversation with optimistic updates
 * Instantly shows conversation in UI before backend confirmation (WhatsApp-style)
 * Returns conversation ID for parent component to handle selection
 */

export function useCreateConversation(onConversationCreated?: (conversation: ConversationWithMetadata) => void) {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (participantIds: string[]) => {
      console.log('🚀 [MUTATION] Starting conversation creation', { participantIds, authHeaders });
      
      // First, check if conversation already exists
      console.log('🔍 [MUTATION] Checking if conversation exists...');
      const checkResult = await checkConversationExists(participantIds, authHeaders);
      console.log('✅ [MUTATION] Check result:', checkResult);
      
      if (checkResult.data.exists && checkResult.data.conversationId) {
        // Conversation exists - need to fetch full conversation data
        console.log('📋 [MUTATION] Conversation already exists, fetching full data...');
        // For now, we'll return a marker and let the frontend handle it
        // In production, you might want to add an API call to fetch the full conversation
        return {
          conversationId: checkResult.data.conversationId,
          conversation: null, // Will be fetched separately if needed
          isNew: false,
        };
      }

      // Conversation doesn't exist, create new one
      console.log('➕ [MUTATION] Creating new conversation...');
      const createResult = await createConversation(participantIds, authHeaders);
      console.log('✅ [MUTATION] Conversation created:', createResult);
      
      // Backend now returns full enriched conversation object
      // Cast to ConversationWithMetadata since backend returns ConversationWithMetadataDto
      return {
        conversation: createResult.data as any as ConversationWithMetadata,
        isNew: true,
      };
    },
    
    // Optimistic update: Add conversation to cache immediately
    onMutate: async (participantIds: string[]) => {
      console.log('⚡ [OPTIMISTIC] Starting optimistic update', { participantIds });
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.chat.conversations.list() 
      });

      // Get the current cached data for rollback
      const previousConversations = queryClient.getQueryData<InfiniteData<GetConversationsResponse>>(
        queryKeys.chat.conversations.list()
      );

      // Get chat suggestions to find user profile data
      const cachedSuggestions = queryClient.getQueryData<any>(
        queryKeys.chat.suggestions.list()
      );

      console.log('📦 [OPTIMISTIC] Cached suggestions:', cachedSuggestions);

      // Handle different possible data structures from cache
      let suggestions: any[] = [];
      if (Array.isArray(cachedSuggestions)) {
        suggestions = cachedSuggestions;
      } else if (cachedSuggestions?.data?.suggestions) {
        // Might be the raw API response
        suggestions = cachedSuggestions.data.suggestions;
      }

      console.log('✅ [OPTIMISTIC] Processed suggestions array:', suggestions);

      // Find the user data from suggestions (if available)
      const otherUserId = participantIds[0]; // Assuming single user for now
      const suggestedUser = suggestions.find(s => s.id === otherUserId);

      // Create optimistic conversation ID (temporary)
      const optimisticId = `temp-${Date.now()}`;

      // Create optimistic participant
      const optimisticParticipant: ConversationWithMetadata['participants'][0] = {
        userId: otherUserId,
        username: suggestedUser?.username || 'user',
        name: suggestedUser?.fullName || suggestedUser?.username || 'User',
        profilePhoto: suggestedUser?.profilePhoto || null,
      };

      // Create optimistic conversation
      const optimisticConversation: ConversationWithMetadata = {
        conversationId: optimisticId,
        participantIds: [session?.user?.id || '', ...participantIds],
        participants: [optimisticParticipant],
        lastMessage: null,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      };

      // Optimistically update the cache
      queryClient.setQueryData<InfiniteData<GetConversationsResponse>>(
        queryKeys.chat.conversations.list(),
        (old) => {
          if (!old) {
            return {
              pages: [{
                success: true,
                data: [optimisticConversation],
                pagination: { limit: 20, offset: 0, count: 1 }
              }],
              pageParams: [0],
            } as InfiniteData<GetConversationsResponse>;
          }

          // Check if we already have a conversation with this user
          // Flatten all pages to check
          const existingConversation = old.pages
            .flatMap(page => page.data)
            .find(conv => conv.participants.some(p => p.userId === otherUserId));

          if (existingConversation) {
             console.log('⚡ [OPTIMISTIC] Conversation already in cache, skipping optimistic addition');
             return old;
          }

          // Add to the beginning of the first page
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                return {
                  ...page,
                  data: [optimisticConversation, ...page.data],
                };
              }
              return page;
            }),
          };
        }
      );

      // Return context for rollback
      return { previousConversations, optimisticId };
    },

    onSuccess: ({ conversation, conversationId, isNew }, variables, context) => {
      console.log('🎉 [SUCCESS] Mutation succeeded', { conversation, conversationId, isNew });
      
      if (isNew && conversation) {
        // Replace optimistic conversation with REAL data from backend
        queryClient.setQueryData<InfiniteData<GetConversationsResponse>>(
          queryKeys.chat.conversations.list(),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((conv) => 
                  conv.conversationId === context?.optimisticId
                    ? conversation // Replace entire optimistic conversation with real backend data
                    : conv
                ),
              })),
            };
          }
        );
      } else if (conversationId) {
        // Existing conversation - just update the ID if it was optimistic
        queryClient.setQueryData<InfiniteData<GetConversationsResponse>>(
          queryKeys.chat.conversations.list(),
          (old) => {
            if (!old) return old;

            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: page.data.map((conv) => 
                  conv.conversationId === context?.optimisticId
                    ? { ...conv, conversationId } // Update temp ID to real ID
                    : conv
                ),
              })),
            };
          }
        );
      }

      // Production approach: Trust the backend data, no need to refetch

      // Show appropriate toast
      if (isNew) {
        toast.success('Conversation created!');
      } else {
        toast.info('Opening existing conversation...');
      }

      // Call callback with real conversation object
      if (conversation) {
        onConversationCreated?.(conversation);
      } else if (conversationId) {
         // Fallback if for some reason we only have ID (shouldn't happen with new logic)
         // We might need to fetch it or just construct a partial one, but let's assume we have it or handle in UI
         // proper type fix later if needed, but for now we prioritized conversation object being present
      }
    },

    onError: (error: any, variables, context) => {
      console.error('❌ [ERROR] Mutation failed', { error, variables });
      // Rollback optimistic update
      if (context?.previousConversations) {
        queryClient.setQueryData(
          queryKeys.chat.conversations.list(),
          context.previousConversations
        );
      }

      console.error('Failed to create conversation:', error);
      toast.error('Failed to start conversation. Please try again.');
    },
  });
}
