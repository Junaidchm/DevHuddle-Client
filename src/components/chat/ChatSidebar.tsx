/**
 * ChatSidebar Component
 * Lists conversations with search and user info
 */

'use client';

import { Conversation, User } from '@/src/types/chat.types';
import { Search, MessageCircle, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { PROFILE_DEFAULT_URL } from '@/src/constents';

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
      <div className="p-4 border-b border-border bg-card sticky top-0 z-10">
        <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent">
          Messages
        </h2>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground px-4">
            <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm text-center">
              {searchQuery
                ? 'No conversations found'
                : 'No conversations yet. Start chatting!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conv) => {
              const otherUser = getOtherParticipant(conv);
              const isSelected = conv.id === selectedConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors ${
                    isSelected ? 'bg-muted' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative">
                    {otherUser?.profileImage ? (
                      <img
                        src={otherUser.profileImage}
                        alt={otherUser.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white font-semibold">
                        {otherUser?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    {/* Online indicator (placeholder) */}
                    {otherUser?.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    {/* Name and Time */}
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">
                        {otherUser?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>

                    {/* Last Message */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                      {/* Unread Badge */}
                      {conv.unreadCount && conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 bg-gradient-to-br from-gradient-start to-gradient-end text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                          {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                        </span>
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
