/**
 * ChatWindow Component
 * Main chat area with messages and input
 */

'use client';

import { Message, ConversationWithMetadata } from '@/src/types/chat.types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { ChatDetails } from './ChatDetails';
import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Phone, Video, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { PROFILE_DEFAULT_URL } from '@/src/constants';
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { useWebSocket } from "@/src/contexts/WebSocketContext";

interface ChatWindowProps {
  conversation: ConversationWithMetadata | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onTyping?: () => void;
  onStopTyping?: () => void;
  isLoadingMessages?: boolean;
  hasMoreMessages?: boolean;
  onLoadMore?: () => void;
  isConnected?: boolean;
}

export default function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onTyping,
  onStopTyping,
  isLoadingMessages = false,
  hasMoreMessages = false,
  onLoadMore,
  isConnected = true,
}: ChatWindowProps) {
  const { sendReadReceipt } = useWebSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Send read receipt when new messages arrive
  useEffect(() => {
    if (!conversation?.conversationId || !messages.length || !isConnected) return;

    // Find the last message that is NOT from the current user
    // We assume messages are ordered chronologically (oldest to newest)
    const lastIncomingMessage = [...messages].reverse().find(
        msg => msg.senderId !== currentUserId
    );

    if (lastIncomingMessage && lastIncomingMessage.status !== 'READ' && lastIncomingMessage.status !== 'read') {
        // Send read receipt for this message (backend handles marking previous ones)
        // console.log("Sending read receipt for:", lastIncomingMessage.id);
        sendReadReceipt(conversation.conversationId, lastIncomingMessage.id);
    }
  }, [messages, conversation?.conversationId, currentUserId, isConnected, sendReadReceipt]);

  // Get other participant info (flat structure in ConversationWithMetadata)
  const otherParticipant = conversation?.participants.find(
    (p) => p.userId !== currentUserId
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, shouldAutoScroll]);

  // Check if user is near bottom to enable auto-scroll
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);

    // Load more messages when scrolling to top
    if (scrollTop === 0 && hasMoreMessages && onLoadMore && !isLoadingMessages) {
      onLoadMore();
    }
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground p-6">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
          <p className="text-lg font-medium">Select a conversation to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* Header */}
      <ChatHeader 
        conversation={conversation}
        currentUserId={currentUserId}
        isConnected={isConnected}
        onViewInfo={() => setShowDetails(true)}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
      >
        {/* Load More Indicator */}
        {hasMoreMessages && (
          <div className="flex justify-center py-2">
            {isLoadingMessages ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadMore}
                className="text-muted-foreground hover:text-foreground"
              >
                Load more messages
              </Button>
            )}
          </div>
        )}

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.filter(msg => !!msg).map((message) => {
            // Determine sender details
            const isOwn = message.senderId === currentUserId;
            
            // Try to find sender in participants if message.sender is missing
             const senderParticipant = !message.sender 
                ? conversation?.participants.find((p) => p.userId === message.senderId)
                : null;
            
             // For groups, we always want to show name/avatar for others
             // For direct, we might already show it in header, but bubble handles it nicely usually
             const senderName = isOwn 
                ? 'You' 
                : message.sender?.username || senderParticipant?.username || 'Unknown';
                
             const senderAvatar = isOwn
                ? undefined
                : message.sender?.profileImage || senderParticipant?.profilePhoto || undefined;

            return (
                <MessageBubble
                key={message.id || Math.random().toString()}
                message={message}
                isOwn={isOwn}
                senderName={senderName}
                senderAvatar={senderAvatar}
                />
            );
          })
        )}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {(() => {
        // Permission Check
        const myPart = conversation?.participants.find((p: any) => p.userId === currentUserId);
        const isAdmin = myPart?.role === 'ADMIN' || conversation?.ownerId === currentUserId;
        const isGroup = conversation?.type === 'GROUP';
        const canPost = !isGroup || !conversation?.onlyAdminsCanPost || isAdmin;

        return (
          <ChatInput
            disabled={!isConnected || !canPost}
            placeholder={!canPost ? "Only admins can send messages" : undefined}
            conversationId={conversation?.conversationId || ''}
          />
        );
      })()}
      
      {showDetails && conversation && (
          <ChatDetails 
             conversation={conversation} 
             currentUserId={currentUserId}
             onClose={() => setShowDetails(false)}
          />
      )}
    </div>
  );
}
