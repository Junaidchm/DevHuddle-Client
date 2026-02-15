"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Edit, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { NewChatModal } from "./NewChatModal";
import { EmptyState } from "./EmptyState";
import { ConversationListSkeleton } from "./ConversationListSkeleton";
import { useConversations, useCreateConversation } from "@/src/hooks/chat/useConversationQuery";
import { useGroupSocketEvents } from "@/src/hooks/chat/useGroupSocketEvents";

import { ConversationWithMetadata } from "@/src/types/chat.types";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface ConversationListProps {
  selectedId?: string;
  onSelect: (conversation: ConversationWithMetadata) => void;
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

  // Listen for real-time group events
  useGroupSocketEvents();

  // Create conversation hook with selection callback
  const createConversation = useCreateConversation((conversation) => {
    // Select the newly created conversation
    onSelect(conversation);
  });

  // Flatten pages and deduplicate by conversationId
  const conversations = (() => {
    const allConversations = data?.pages.flatMap(page => page.data) ?? [];
    const seenIds = new Set<string>();
    const uniqueConversations: typeof allConversations = [];
    
    for (const conv of allConversations) {
      if (!conv || !conv.conversationId) continue;
      if (!seenIds.has(conv.conversationId)) {
        seenIds.add(conv.conversationId);
        uniqueConversations.push(conv);
      }
    }
    
    return uniqueConversations;
  })();

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
    console.log('👆 [CLICK] User clicked suggestion', { userId });
    
    // FAST PATH: Check if we already have this conversation in our local list
    const existingConversation = conversations.find(c => 
      c.participants.some(p => p.userId === userId)
    );

    if (existingConversation) {
       console.log('⚡ [INSTANT] Found in cache, switching immediately', existingConversation.conversationId);
       onSelect(existingConversation as any as ConversationWithMetadata);
    }

    // Still trigger mutation to ensure backend sync/fetch latest data
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
      <div className="relative flex flex-col h-full bg-card border-r border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <Button variant="ghost" size="icon" disabled>
            <Edit className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
        <ConversationListSkeleton />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Failed to load conversations</p>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="relative flex flex-col h-full bg-card border-r border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsNewChatModalOpen(true)}
            className="rounded-full"
          >
            <Edit className="w-5 h-5" />
          </Button>
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
    <div className="relative flex flex-col h-full bg-card border-r border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Messages
        </h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsNewChatModalOpen(true)}
          className="rounded-full text-muted-foreground hover:text-foreground"
          aria-label="New message"
          title="New message"
        >
          <Edit className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3 bg-card sticky top-[65px] z-10 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/40"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv, index) => {
          // Get the other participant (not current user)
          // If no other participant found (e.g. self chat), fall back to the first participant
          const otherParticipant = conv.participants.find(
            p => p.userId !== (currentUserId || session?.user?.id)
          ) || conv.participants[0] || { name: 'Unknown User', username: 'unknown', profilePhoto: null, userId: '' };

          // Format time
          const timeAgo = conv.lastMessageAt 
            ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })
            : '';

          const isLast = index === filteredConversations.length - 1;
          const isSelected = selectedId === conv.conversationId;
          
          const displayName = conv.type === 'GROUP' 
            ? (conv.name || "Group Chat")
            : (otherParticipant.name || otherParticipant.username || "Unknown User");

          return (
            <div 
              key={conv.conversationId}
              ref={isLast ? lastConversationRef : null}
            >
              <button
                onClick={() => onSelect(conv as any as ConversationWithMetadata)}
                className={cn(
                  "w-full p-4 flex items-start gap-3 transition-all border-b border-border/40 hover:bg-muted/50 text-left",
                  isSelected && "bg-muted/60 hover:bg-muted/70"
                )}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {conv.type === 'GROUP' ? (
                        <Avatar className="w-12 h-12 border border-border">
                            <AvatarImage src={conv.icon || undefined} alt={displayName || "Group"} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {(conv.name || "G").charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    ) : (
                        <Avatar className="w-12 h-12 border border-border">
                            <AvatarImage src={otherParticipant.profilePhoto || PROFILE_DEFAULT_URL} alt={displayName} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                                {displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn("font-medium text-sm truncate", isSelected ? "text-foreground" : "text-foreground/90")}>
                      {displayName}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {timeAgo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={cn("text-xs truncate flex-1", conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                      {(() => {
                        const lastMsg = conv.lastMessage;
                        if (!lastMsg) return 'No messages yet';

                        // If we have content, show it
                        if (lastMsg.content && lastMsg.content.trim().length > 0) {
                          return lastMsg.content;
                        }

                        // Map message type to preview text
                        // Backend might send 'IMAGE', 'VIDEO' etc. or 'CHAT_IMAGE' (check types)
                        const type = (lastMsg as any).type || 'TEXT';
                        
                        switch (type) {
                          case 'IMAGE':
                          case 'CHAT_IMAGE':
                            return '📷 Photo';
                          case 'VIDEO':
                          case 'CHAT_VIDEO':
                            return '🎥 Video';
                          case 'AUDIO':
                          case 'CHAT_AUDIO':
                            return '🎵 Audio';
                          case 'FILE':
                          case 'CHAT_FILE':
                            return '📄 File';
                          case 'STICKER':
                            return '💟 Sticker';
                          default:
                            return 'No messages yet';
                        }
                      })()}
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2 h-5 min-w-[20px] px-1.5 flex items-center justify-center text-[10px]">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="p-4 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <NewChatModal 
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onUserSelect={handleNewConversation}
        onConversationSelect={(conversation) => {
            onSelect(conversation);
            setIsNewChatModalOpen(false);
        }}
      />
    </div>
  );
}
