"use client";

import React, { useState } from "react";
import { ConversationList } from "@/src/components/chat/ConversationList";
import { ChatHeader } from "@/src/components/chat/ChatHeader";
import { MessageList } from "@/src/components/chat/MessageList";
import { ChatInput } from "@/src/components/chat/ChatInput";
import { useMessages } from "@/src/hooks/chat/useMessages";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { useSession } from "next-auth/react";

export default function ChatPage() {
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMetadata | null>(null);
  
  //✅ REAL-TIME: Fetch messages using useMessages hook (integrates with WebSocket)
  const { data: messages = [], isLoading } = useMessages(
    selectedConversation?.conversationId ?? null
  );

  const handleSelectConversation = (conversation: ConversationWithMetadata) => {
    setSelectedConversation(conversation);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-[1800px] mx-auto bg-gray-50">
      {/* Left Sidebar - Conversations */}
      <div className="w-full md:w-96 flex-shrink-0 shadow-sm">
        <ConversationList
          selectedId={selectedConversation?.conversationId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Right Side - Chat */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-white">
          {(() => {
             const otherParticipant = selectedConversation.participants.find(
                p => p.userId !== session?.user?.id
             ) || selectedConversation.participants[0];
             
             return (
              <ChatHeader
                name={otherParticipant?.name || 'User'}
                avatar={otherParticipant?.name?.charAt(0) || '?'}
                image={otherParticipant?.profilePhoto}
                isOnline={false} // Todo: Real online status
                lastSeen={selectedConversation.lastMessageAt ? new Date(selectedConversation.lastMessageAt).toLocaleTimeString() : undefined}
              />
             );
          })()}

          {/* Messages - REAL-TIME */}
          <MessageList
            messages={messages}
            currentUserId={session?.user?.id || ""}
            isLoading={isLoading}
            getUserName={(userId: string) => {
              if (userId === session?.user?.id) return "You";
              const participant = selectedConversation.participants.find(
                p => p.userId === userId
              );
              return participant?.name || "Unknown";
            }}
          />

          {/* Input - REAL-TIME WebSocket */}
          <ChatInput 
            conversationId={selectedConversation.conversationId}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-16 h-16 text-[#0A66C2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Messaging
            </h2>
            <p className="text-gray-500">
              Select a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
