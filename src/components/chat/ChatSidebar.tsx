/**
 * ChatSidebar Component
 * Lists conversations with search and user info
 */

'use client';

import { Conversation, User } from '@/src/types/chat.types';
import { Search, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { PROFILE_DEFAULT_URL } from '@/src/constants';
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

interface ChatSidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
  isLoading?: boolean;
}

export default function ChatSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  isLoading = false,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      // Search in participant names or last message
      const otherParticipants = conv.participants.filter(
        (p) => p.userId !== currentUserId
      );
      const participantNames = otherParticipants
        .map((p) => p.user?.username || '')
        .join(' ')
        .toLowerCase();
      const lastMessageContent = conv.lastMessage?.content.toLowerCase() || '';

      return (
        participantNames.includes(query) || lastMessageContent.includes(query)
      );
    });
  }, [conversations, searchQuery, currentUserId]);

  // Get other participant info for display
  const getOtherParticipant = (conv: Conversation) => {
    const otherParticipant = conv.participants.find(
      (p) => p.userId !== currentUserId
    );
    return otherParticipant?.user;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card sticky top-0 z-10 space-y-3">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Messages
        </h2>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-4">
            <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-sm text-center">
              {searchQuery
                ? 'No conversations found'
                : 'No conversations yet. Start chatting!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredConversations.map((conv) => {
              const otherUser = getOtherParticipant(conv);
              const isSelected = conv.id === selectedConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    "w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0 text-left",
                    isSelected && "bg-muted/60 hover:bg-muted/70"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="w-12 h-12 border border-border">
                        <AvatarImage src={otherUser?.profileImage || PROFILE_DEFAULT_URL} alt={otherUser?.username || 'User'} className="object-cover" />
                        <AvatarFallback>{otherUser?.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    
                    {/* Online indicator */}
                    {otherUser?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name and Time */}
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className={cn("font-medium text-sm truncate", isSelected ? "text-foreground" : "text-foreground/90")}>
                        {otherUser?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>

                    {/* Last Message */}
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-xs truncate flex-1", conv.unreadCount && conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {/* Unread Badge */}
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <Badge variant="default" className="h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px]">
                            {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
