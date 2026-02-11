"use client";

import React, { useState } from "react";
import { ConversationList } from "@/src/components/chat/ConversationList";
import ChatWindow from "@/src/components/chat/ChatWindow";
import { useMessages } from "@/src/hooks/chat/useMessages";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { useSession } from "next-auth/react";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMetadata | null>(null);
  
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

  // Map ConversationWithMetadata to Conversation for ChatWindow
  const currentConversation = selectedConversation ? {
    id: selectedConversation.conversationId,
    createdAt: new Date().toISOString(), // Fallback as it might be missing in metadata
    participants: selectedConversation.participants.map(p => ({
        userId: p.userId,
        conversationId: selectedConversation.conversationId,
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
        user: {
            id: p.userId,
            username: p.username,
            email: "", // Not available in metadata
            profileImage: p.profilePhoto || undefined,
            isOnline: false // Todo: Real online status
        }
    })),
    lastMessageAt: selectedConversation.lastMessageAt,
    unreadCount: selectedConversation.unreadCount
  } : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] max-w-7xl mx-auto bg-background shadow-sm rounded-lg overflow-hidden border border-border my-2 md:my-4">
      {/* Left Sidebar - Conversations */}
      <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 bg-card border-r border-border ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
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
