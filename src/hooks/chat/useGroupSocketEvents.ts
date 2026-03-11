import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { queryKeys } from '@/src/lib/queryKeys';
import { ConversationWithMetadata } from '@/src/types/chat.types';
import { toast } from 'sonner';

export function useGroupSocketEvents() {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const currentUserId = session?.user?.id;

    useEffect(() => {
            const handleGroupCreated = (e: CustomEvent) => {
            const data = e.detail;
            console.log('✨ [Socket] handling group_created', data);

            // We don't ignore creator anymore, de-duplication logic below handles it
            
            queryClient.setQueryData(queryKeys.chat.conversations.list(), (oldData: any) => {
                if (!oldData || !oldData.pages || oldData.pages.length === 0) {
                    // If no existing data, create structure with new group
                    return {
                        pages: [{
                            data: [data],
                            total: 1,
                            pagination: { limit: 20, offset: 0, count: 1 }
                        }],
                        pageParams: [0]
                    };
                }

                const firstPage = oldData.pages[0];
                
                // ✅ Check if conversation already exists in any page to prevent duplicates
                const exists = oldData.pages.some((page: any) => 
                    page.data.some((conv: any) => conv.conversationId === data.conversationId)
                );
                
                if (exists) {
                    console.log('✨ [Socket] group already exists in cache, skipping prepend', data.conversationId);
                    return oldData;
                }

                return {
                    ...oldData,
                    pages: [
                        {
                            ...firstPage,
                            data: [data, ...(firstPage.data || [])]
                        },
                        ...oldData.pages.slice(1)
                    ]
                };
            });
            toast.info(`New group "${data.name}" created`);
        };

        const handleGroupDeleted = (e: CustomEvent) => {
            const data = e.detail;
            console.log('🗑️ [Socket] handling group_deleted', data);

            queryClient.setQueryData(queryKeys.chat.conversations.list(), (oldData: any) => {
                if (!oldData || !oldData.pages) return oldData;
                
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: Array.isArray(page.data) ? page.data.filter((conv: ConversationWithMetadata) => 
                            conv.conversationId !== data.conversationId
                        ) : []
                    }))
                };
            });

            // Dispatch a global event so the chat view can redirect if the deleted group is currently active
            window.dispatchEvent(new CustomEvent('active_group_deleted', { detail: data }));
            
            toast.error(`Group "${data.groupName || 'deleted'}" has been permanently removed by the owner`);
        };

        const handleGroupUpdated = (e: CustomEvent) => {
            const data = e.detail;
            const updates = data.updates || data; // Handle if updates are nested or direct
            
            queryClient.setQueryData(queryKeys.chat.conversations.list(), (oldData: any) => {
                if (!oldData || !oldData.pages) return oldData;
                
                return {
                    ...oldData,
                    pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: Array.isArray(page.data) ? page.data.map((conv: ConversationWithMetadata) => 
                            conv.conversationId === data.conversationId 
                                ? { ...conv, ...updates } 
                                : conv
                        ) : []
                    }))
                };
            });
        };

        const invalidateList = () => {
             queryClient.invalidateQueries({
                queryKey: queryKeys.chat.conversations.list()
            });
        };

        window.addEventListener('group_created', handleGroupCreated as EventListener);
        window.addEventListener('group_updated', handleGroupUpdated as EventListener);
        window.addEventListener('group_deleted', handleGroupDeleted as EventListener);
        window.addEventListener('participants_added', invalidateList as EventListener);
        window.addEventListener('participant_removed', invalidateList as EventListener);
        window.addEventListener('participant_left', invalidateList as EventListener);
        window.addEventListener('role_updated', invalidateList as EventListener);

        return () => {
            window.removeEventListener('group_created', handleGroupCreated as EventListener);
            window.removeEventListener('group_updated', handleGroupUpdated as EventListener);
            window.removeEventListener('group_deleted', handleGroupDeleted as EventListener);
            window.removeEventListener('participants_added', invalidateList as EventListener);
            window.removeEventListener('participant_removed', invalidateList as EventListener);
            window.removeEventListener('participant_left', invalidateList as EventListener);
            window.removeEventListener('role_updated', invalidateList as EventListener);
        };
    }, [queryClient]);
}
