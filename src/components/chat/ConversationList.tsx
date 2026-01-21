"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Edit } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { NewChatModal } from "./NewChatModal";
import { EmptyState } from "./EmptyState";
import { ConversationListSkeleton } from "./ConversationListSkeleton";
import { useConversations, useCreateConversation } from "@/src/hooks/chat/useConversationQuery";

interface ConversationListProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ selectedId, onSelect }: ConversationListProps) {
  const { data: session } = useSession();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch conversations using TanStack Query
  const { 
    data, 
    isLoading, 
    isError,
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useConversations();

  // Create conversation hook
  const createConversation = useCreateConversation();

  // Flatten pages into single array
  const conversations = data?.pages.flatMap(page => page.data) ?? [];

  // Get current user ID
  const currentUserId = session?.user?.id || '';

  // Intersection observer for infinite scroll
  const lastConversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lastConversationRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(lastConversationRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Handle new conversation
  const handleNewConversation = async (userId: string) => {
    createConversation.mutate([userId]);
  };

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return conv.participants.some(p =>
      p.name.toLowerCase().includes(query) ||
      p.username.toLowerCase().includes(query)
    );
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="relative flex flex-col h-full bg-white border-r border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Messages</h1>
          <button className="p-2 rounded-full" disabled>
            <Edit className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <ConversationListSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">Failed to load conversations</p>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="relative flex flex-col h-full bg-white border-r border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Messages</h1>
          <button 
            onClick={() => setIsNewChatModalOpen(true)}
            className="p-2 hover: rounded-full transition-colors"
          >
            <Edit className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <EmptyState onNewChat={() => setIsNewChatModalOpen(true)} />
        <NewChatModal 
          isOpen={isNewChatModalOpen}
          onClose={() => setIsNewChatModalOpen(false)}
          onUserSelect={handleNewConversation}
        />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-800">
          Messages
        </h1>
        <button 
          onClick={() => setIsNewChatModalOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="New message"
          title="New message"
        >
          <Edit className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Search */}
      <div className="p-3 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0A66C2] focus:ring-2 focus:ring-[#0A66C2]/10 transition-all text-gray-800 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {filteredConversations.map((conv, index) => {
          // Get the other participant (not current user)
          const otherParticipant = conv.participants.find(
            p => p.userId !== currentUserId
          ) || conv.participants[0];

          // Format time
          const timeAgo = conv.lastMessageAt 
            ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })
            : '';

          const isLast = index === filteredConversations.length - 1;

          return (
            <div 
              key={conv.conversationId}
              ref={isLast ? lastConversationRef : null}
            >
              <button
                onClick={() => onSelect(conv.conversationId)}
                className={`
                  w-full p-4 flex items-start gap-3 transition-all border-l-3 bg-white hover:bg-gray-50 border-b border-gray-100
                  ${selectedId === conv.conversationId 
                    ? 'border-l-[#0A66C2] bg-blue-50/50' 
                    : 'border-l-transparent'
                  }
                `}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {otherParticipant.profilePhoto ? (
                    <img 
                      src={otherParticipant.profilePhoto}
                      alt={otherParticipant.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white font-semibold shadow-sm">
                      {otherParticipant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {otherParticipant.name}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {timeAgo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 bg-[#0A66C2] rounded-full flex items-center justify-center text-xs text-white font-semibold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="p-4 text-center">
            <span className="text-sm text-gray-500">Loading more...</span>
          </div>
        )}
      </div>

      <NewChatModal 
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onUserSelect={handleNewConversation}
      />
    </div>
  );
}
