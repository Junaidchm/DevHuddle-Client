"use client";

import React, { useState } from "react";
import { ConversationList } from "@/src/components/chat/ConversationList";
import ChatWindow from "@/src/components/chat/ChatWindow";
import { useMessages } from "@/src/hooks/chat/useMessages";
import { useConversations } from "@/src/hooks/chat/useConversationQuery";
import { ConversationWithMetadata, ConversationParticipant } from "@/src/types/chat.types";
import { useSession } from "next-auth/react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversationById } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from "@/src/lib/queryKeys";

const mapToMetadata = (conv: any): ConversationWithMetadata => {
  if (!conv) return conv;
  return {
    ...conv,
    conversationId: conv.conversationId || conv.id,
    participantIds: conv.participantIds || conv.participants?.map((p: any) => p.userId) || [],
    participants: conv.participants?.map((p: any) => ({
        userId: p.userId,
        username: p.username || p.user?.username || "user",
        name: p.name || p.user?.fullName || p.user?.name || "User",
        profilePhoto: p.profilePhoto || p.user?.profilePhoto || null,
        role: p.role,
        conversationId: conv.conversationId || conv.id,
        createdAt: conv.createdAt,
        lastReadAt: p.lastReadAt || conv.createdAt
    })) || [],
    lastMessage: conv.lastMessage || null,
    lastMessageAt: conv.lastMessageAt || conv.updatedAt || conv.createdAt,
    unreadCount: conv.unreadCount || 0,
    createdAt: conv.createdAt
  };
};

export default function ChatPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");
  const headers = useAuthHeaders();
  const queryClient = useQueryClient();
  
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMetadata | null>(null);
  
  // Get fresh conversations list for syncing
  const { data: convData } = useConversations();

  // Sync selectedConversation with cache whenever list updates
  React.useEffect(() => {
    if (!selectedConversation?.conversationId || !convData) return;

    // Find fresh version in conversation list cache
    const fresh = convData.pages.flatMap((p: any) => p.data).find(
      (c: any) => (c.conversationId || c.id) === selectedConversation.conversationId
    );
    
    if (fresh) {
      // Deep check for flags that affect UI state — ✅ include memberCount and participants
      const hasChanged = 
        fresh.isBlockedByMe !== selectedConversation.isBlockedByMe ||
        fresh.isBlockedByThem !== selectedConversation.isBlockedByThem ||
        fresh.name !== selectedConversation.name ||
        fresh.icon !== selectedConversation.icon ||
        (fresh.memberCount ?? fresh.participants?.length ?? 0) !== (selectedConversation.memberCount ?? selectedConversation.participants?.length ?? 0) ||
        (fresh.participants?.length ?? 0) !== (selectedConversation.participants?.length ?? 0);

      if (hasChanged) {
        console.log("🔄 [Sync] Updating selectedConversation from cache", { 
            id: fresh.conversationId, 
            memberCount: fresh.memberCount,
            participantCount: fresh.participants?.length,
        });
        setSelectedConversation(mapToMetadata(fresh));
      }
    }
  }, [convData, selectedConversation?.conversationId]);

  // Fetch conversation by ID if present in URL
  const { data: fetchedConversation } = useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => getConversationById(conversationId!, headers),
    enabled: !!conversationId && !!headers.Authorization,
  });

  // Set selected conversation when fetched
  React.useEffect(() => {
    if (fetchedConversation) {
        // Use mapping helper to ensure it matches ConversationWithMetadata structure
        setSelectedConversation(mapToMetadata(fetchedConversation));
    }
  }, [fetchedConversation]);
  
  const { 
    data: messages = [], 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useMessages(
    selectedConversation?.conversationId ?? null
  );

  const handleSelectConversation = (conversation: ConversationWithMetadata) => {
    setSelectedConversation(conversation);
  };

  // Listen for real-time updates to the selected conversation
  React.useEffect(() => {
    if (!selectedConversation) return;

    const handleGroupUpdated = (e: CustomEvent) => {
        const data = e.detail;
        if (data.conversationId === selectedConversation.conversationId) {
             const updates = data.updates || data;
             setSelectedConversation(prev => prev ? ({ ...prev, ...updates }) : null);
        }
    };

    // For participants changes, we might want to re-fetch or assume the list update will handle it?
    // But since selectedConversation is local state, we should probably update it too if we have the data.
    // However, the event data for participants_added might not have full conversation metadata.
    // So simpler approach: If participants change, and it's the valid conversation, 
    // we might need to fetch the fresh conversation data or let the user re-select.
    // Improving UX: We can listen to the React Query cache update instead?
    // Or just listen to the event and update if simple enough.
    
    const handleParticipantsAdded = (e: CustomEvent) => {
        const data = e.detail;
        console.log("👥 [Socket] handleParticipantsAdded received:", data);
        
        if (data.conversationId === selectedConversation.conversationId) {
            const newParticipantIds: string[] = data.newParticipants || data.participants || [];
            const addedCount = newParticipantIds.length;

            console.log(`[Socket] Updating active conversation ${data.conversationId} with ${addedCount} new members`);

            // ✅ Optimistic update: bump memberCount instantly for immediate UI feedback
            if (addedCount > 0) {
                setSelectedConversation(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        memberCount: (prev.memberCount ?? prev.participants?.length ?? 0) + addedCount,
                    };
                });
            }

            // ✅ Also invalidate both caches so participants list and count reload with full profile data
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
            
            // ✅ FIX: Use selectedConversation.conversationId strictly for invalidation
            // Previously used `conversationId` from searchParams which could be null
            queryClient.invalidateQueries({ queryKey: ["conversation", selectedConversation.conversationId] });
        }
    };

    const handleHubJoinRequested = (e: CustomEvent) => {
        const data = e.detail;
        console.log("🎟️ [Socket] handleHubJoinRequested received:", data);
        
        // Notify the owner/admin
        toast.info(`New join request for "${data.hubName || 'Hub'}"`, {
            description: "Go to Hub Settings > Requests to approve.",
            duration: 5000,
        });

        // Invalidate specific conversation to show badge on Requests tab if open
        if (data.hubId === selectedConversation.conversationId) {
            queryClient.invalidateQueries({ queryKey: ["conversation", selectedConversation.conversationId] });
        }
    };

    const handleParticipantRemoved = (e: CustomEvent) => {
        const data = e.detail;
        if (data.conversationId === selectedConversation.conversationId) {
             const removedId = data.removedUserId || data.userId;
             setSelectedConversation(prev => {
                if (!prev) return null;
                // If current user is removed, deselect conversation?
                if (removedId === session?.user?.id) {
                    return null; 
                }
                return {
                    ...prev,
                    participants: prev.participants.filter(p => p.userId !== removedId)
                };
             });
        }
    };

    const handleRoleUpdated = (e: CustomEvent) => {
         const data = e.detail;
         if (data.conversationId === selectedConversation.conversationId) {
              const { userId, role } = data;
              setSelectedConversation(prev => {
                  if (!prev) return null;
                  return {
                      ...prev,
                      participants: prev.participants.map(p => 
                          p.userId === userId ? { ...p, role } : p
                      )
                  };
              });
         }
    };

    const handleBlockUpdated = (e: CustomEvent) => {
         const { conversationId, isBlockedByMe, isBlockedByThem } = e.detail;
         if (conversationId === selectedConversation.conversationId) {
              setSelectedConversation(prev => {
                  if (!prev) return null;
                  return {
                      ...prev,
                      isBlockedByMe,
                      isBlockedByThem
                  };
              });
         }
    };

    const handleActiveGroupDeleted = (e: CustomEvent) => {
        const data = e.detail;
        if (data.conversationId === selectedConversation.conversationId) {
            console.log("🚫 [Redirect] Active group deleted, deselecting", data.conversationId);
            setSelectedConversation(null);
        }
    };

    // For now, let's just handle metadata updates (name, icon)
    window.addEventListener('group_updated', handleGroupUpdated as EventListener);
    window.addEventListener('active_group_deleted', handleActiveGroupDeleted as EventListener);
    window.addEventListener('participants_added', handleParticipantsAdded as EventListener);
    window.addEventListener('hub_join_approved', handleParticipantsAdded as EventListener); // Alias for refresh
    window.addEventListener('hub_join_requested', handleHubJoinRequested as EventListener); // New: Notify admin
    window.addEventListener('participant_removed', handleParticipantRemoved as EventListener); // handling remove by admin
    window.addEventListener('participant_left', handleParticipantRemoved as EventListener); // handling self leave (same logic)
    window.addEventListener('role_updated', handleRoleUpdated as EventListener);
    window.addEventListener('chat:block_updated', handleBlockUpdated as EventListener);

    return () => {
        window.removeEventListener('group_updated', handleGroupUpdated as EventListener);
        window.removeEventListener('active_group_deleted', handleActiveGroupDeleted as EventListener);
        window.removeEventListener('participants_added', handleParticipantsAdded as EventListener);
        window.removeEventListener('hub_join_approved', handleParticipantsAdded as EventListener);
        window.removeEventListener('hub_join_requested', handleHubJoinRequested as EventListener);
        window.removeEventListener('participant_removed', handleParticipantRemoved as EventListener);
        window.removeEventListener('participant_left', handleParticipantRemoved as EventListener);
        window.removeEventListener('role_updated', handleRoleUpdated as EventListener);
        window.removeEventListener('chat:block_updated', handleBlockUpdated as EventListener);
    };
  }, [selectedConversation, session?.user?.id]);

  // Use selectedConversation directly - no transformation needed
  const currentConversation = selectedConversation;

  return (
    <div className="flex h-[calc(100vh-52px)] md:h-[calc(100vh-56px)] -mt-6 -mb-6 bg-background overflow-hidden w-full">
      {/* Left Sidebar - Conversations */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 bg-background ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <ConversationList
          selectedId={selectedConversation?.conversationId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Right Side - Chat */}
      <div className={`flex-1 flex flex-col bg-background ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {currentConversation ? (
          <ChatWindow
            conversation={currentConversation}
            messages={messages}
            currentUserId={session?.user?.id || ""}
            onSendMessage={() => {}} // Handled internally by ChatInput
            isLoadingMessages={isLoading || isFetchingNextPage}
            hasMoreMessages={hasNextPage}
            onLoadMore={() => fetchNextPage()}
            onConversationDeleted={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Messages
              </h2>
              <p className="text-muted-foreground max-w-xs mx-auto">
                Select a conversation from the left to start chatting or start a new one.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
