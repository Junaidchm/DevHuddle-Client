import { useCallback } from 'react';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from '@/src/contexts/WebSocketContext';
import { Message, MessageType, GetMessagesResponse } from '@/src/types/chat.types';
import { CHAT_CONFIG, WS_EVENTS } from '@/src/constants/chat.constants';
import { queryKeys } from '@/src/lib/queryKeys';

interface SendMessageOptions {
  conversationId: string;
  content: string;
  type?: MessageType;
  mediaDetails?: {
    mediaId: string;
    mediaUrl: string;
    fileName?: string;
    fileSize?: number;
    duration?: number; // For audio/video
    mimeType?: string;
  };
  replyToId?: string;
}

export function useSendMessage() {
  const { sendMessage: sendWsMessage, isConnected } = useWebSocket();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const sendMessage = useCallback(async ({
    conversationId,
    content,
    type = 'TEXT',
    mediaDetails,
    replyToId
  }: SendMessageOptions) => {
    if (!isConnected || !session?.user?.id) {
        console.warn('[useSendMessage] Cannot send: Disconnected or no session');
        return false;
    }

    const dedupeId = uuidv4();
    const tempId = `${CHAT_CONFIG.OPTIMISTIC_ID_PREFIX}${dedupeId}`;
    const now = new Date().toISOString();

    // Construct the optimistic message object
    // Adapting to match the Message interface strictly
    const optimisticMessage: Message = {
      id: tempId,
      conversationId,
      senderId: session.user.id,
      content,
      type,
      status: 'sending', // Local status
      createdAt: now,
      updatedAt: now,
      dedupeId,
      replyToId,
      isForwarded: false, 
      reactions: [],
      // Media Fields
      ...(mediaDetails && {
        mediaId: mediaDetails.mediaId,
        mediaUrl: mediaDetails.mediaUrl,
        mediaName: mediaDetails.fileName,
        mediaSize: mediaDetails.fileSize,
        mediaDuration: mediaDetails.duration,
        mediaMimeType: mediaDetails.mimeType,
      }),
    };

    // 1. Optimistic Update (React Query)
    queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(
      queryKeys.chat.messages.list(conversationId),
      (oldData) => {
        const newPages = oldData ? [...oldData.pages] : [];

        if (newPages.length > 0) {
            newPages[0] = {
                ...newPages[0],
                messages: [optimisticMessage, ...(newPages[0].messages || [])]
            };
        } else {
            newPages.push({
                messages: [optimisticMessage],
                hasMore: false,
                total: 1
            });
        }

        return {
          pages: newPages,
          pageParams: oldData ? oldData.pageParams : [0],
        };
      }
    );

    // 2. Optimistic Update (Conversation List)
    // Instantly move conversation to top and update last message
    queryClient.setQueryData<InfiniteData<{ data: any[] }>>(
      queryKeys.chat.conversations.list(),
      (oldData) => {
         if (!oldData) return oldData;
         const newPages = [...oldData.pages];

         // Find conversation in any page
         let foundConversation: any = null;
         let foundPageIndex = -1;
         let foundUiIndex = -1;

         for (let i = 0; i < newPages.length; i++) {
             const index = newPages[i].data.findIndex((c: any) => c.conversationId === conversationId);
             if (index !== -1) {
                 foundConversation = newPages[i].data[index];
                 foundPageIndex = i;
                 foundUiIndex = index;
                 break;
             }
         }

         if (foundConversation) {
             // Remove from old position
             const updatedPageData = [...newPages[foundPageIndex].data];
             updatedPageData.splice(foundUiIndex, 1);
             newPages[foundPageIndex] = { ...newPages[foundPageIndex], data: updatedPageData };

             // Update Metadata
             const updatedConversation = {
                 ...foundConversation,
                 lastMessage: optimisticMessage,
                 lastMessageAt: now,
                 unreadCount: foundConversation.unreadCount // Sender doesn't increase own unread count
             };

             // Prepend to first page (Move to Top)
             if (newPages.length > 0) {
                 newPages[0] = {
                     ...newPages[0],
                     data: [updatedConversation, ...newPages[0].data]
                 };
             }
         }

         return {
             ...oldData,
             pages: newPages
         };
      }
    );

    // 3. Send via WebSocket
    sendWsMessage({
      type: WS_EVENTS.SEND_MESSAGE,
      conversationId,
      content,
      dedupeId,
      // Spread the rest of the payload required by backend
      // Note: Backend DTOs must match these fields
      ...({
        messageType: type,
        replyToId,
        ...mediaDetails
      } as any) 
    });

    return true;
  }, [isConnected, session, queryClient, sendWsMessage]);

  return { sendMessage, isConnected };
}
