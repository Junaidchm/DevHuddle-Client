"use client";

import React, { useState } from "react";
import { ConversationList } from "@/src/components/chat/ConversationList";
import { ChatHeader } from "@/src/components/chat/ChatHeader";
import { MessageList } from "@/src/components/chat/MessageList";
import { ChatInput } from "@/src/components/chat/ChatInput";

import { ConversationWithMetadata } from "@/src/types/chat.types";
import { useSession } from "next-auth/react";

type MessageStatus = "sending" | "sent" | "delivered" | "read";

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  status?: MessageStatus;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithMetadata | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSelectConversation = (conversation: ConversationWithMetadata) => {
    setSelectedConversation(conversation);
    // TODO: Fetch messages for this conversation
    setMessages([]);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: "me",
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setMessages([...messages, newMessage]);

    // TODO: Send message via API/WebSocket
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id
            ? { ...msg, status: "sent" as MessageStatus }
            : msg
        )
      );
    }, 1000);
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

          {/* Messages */}
          <MessageList
            messages={messages}
            currentUserId="me"
            getUserName={(userId: string) => {
              if (userId === "me") return "You";
              return "Other User";
            }}
          />

          {/* Input */}
          <ChatInput onSend={handleSendMessage} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-16 h-16 text-[#0A66C2]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
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
