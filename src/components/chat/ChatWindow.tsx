/**
 * ChatWindow Component
 * Main chat area with messages and input
 */

'use client';

import { Message, Conversation } from '@/src/types/chat.types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Phone, Video, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { PROFILE_DEFAULT_URL } from '@/src/constants';
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { useWebSocket } from "@/src/contexts/WebSocketContext";

interface ChatWindowProps {
  conversation: Conversation | null;
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

  // Send read receipt when new messages arrive
  useEffect(() => {
    if (!conversation?.id || !messages.length || !isConnected) return;

    // Find the last message that is NOT from the current user
    // We assume messages are ordered chronologically (oldest to newest)
    const lastIncomingMessage = [...messages].reverse().find(
        msg => msg.senderId !== currentUserId
    );

    if (lastIncomingMessage && lastIncomingMessage.status !== 'READ' && lastIncomingMessage.status !== 'read') {
        // Send read receipt for this message (backend handles marking previous ones)
        // console.log("Sending read receipt for:", lastIncomingMessage.id);
        sendReadReceipt(conversation.id, lastIncomingMessage.id);
    }
  }, [messages, conversation?.id, currentUserId, isConnected, sendReadReceipt]);

  // Get other participant info
  const otherParticipant = conversation?.participants.find(
    (p) => p.userId !== currentUserId
  );
  const otherUser = otherParticipant?.user;

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
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Avatar */}
            <Avatar className="w-10 h-10 border border-border">
                <AvatarImage src={otherUser?.profileImage || PROFILE_DEFAULT_URL} alt={otherUser?.username || 'User'} className="object-cover" />
                <AvatarFallback>{otherUser?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>

          {/* User Info */}
          <div>
            <h3 className="font-semibold text-foreground">
              {otherUser?.username || 'Unknown User'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {otherUser?.isOnline ? (
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online
                </span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          {!isConnected && (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full text-xs mr-2">
              <AlertCircle className="w-3 h-3" />
              Disconnected
            </div>
          )}

          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

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
          messages.filter(msg => !!msg).map((message) => (
            <MessageBubble
              key={message.id || Math.random().toString()}
              message={message}
              isOwn={message.senderId === currentUserId}
              senderName={
                message.senderId === currentUserId
                  ? undefined
                  : otherUser?.username
              }
              senderAvatar={
                message.senderId === currentUserId
                  ? undefined
                  : otherUser?.profileImage
              }
            />
          ))
        )}

        {/* Scroll Anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        disabled={!isConnected}
        conversationId={conversation?.id || ''}
      />
    </div>
  );
}
