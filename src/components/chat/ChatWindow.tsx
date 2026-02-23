/**
 * ChatWindow Component
 * Main chat area with messages and input
 */

'use client';

import { Message, ConversationWithMetadata } from '@/src/types/chat.types';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { ProfilePanel } from './ProfilePanel';
import { PinnedMessageBar } from './PinnedMessageBar'; 
import { getPinnedMessages, unpinMessage, forwardMessages, unblockUser, softDeleteConversation } from '@/src/services/api/chat.service';
import { toast } from 'react-hot-toast';
import { getConnections } from '@/src/services/api/engagement.service';
import { useConversations } from '@/src/hooks/chat/useConversationQuery';
import { ForwardModal } from './ForwardModal';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useQueryClient, InfiniteData } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/queryKeys';
import { GetMessagesResponse } from '@/src/types/chat.types';
import { MoreVertical, Phone, Video, Loader2, AlertCircle, MessageCircle, Forward, X } from 'lucide-react';
import { Button } from "@/src/components/ui/button";
import { useWebSocket } from "@/src/contexts/WebSocketContext";
import { ChatWindowSkeleton } from "@/src/components/skeletons/ChatWindowSkeleton";
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { formatSystemMessage } from '@/src/lib/chat-utils';

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
  onConversationDeleted?: () => void;
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
  onConversationDeleted,
}: ChatWindowProps) {



  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const { sendReadReceipt } = useWebSocket();
  const authHeaders = useAuthHeaders();
  const queryClient = useQueryClient();

  // Selection & Forwarding State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const { data: convData } = useConversations();

  // Flatten conversations for ForwardModal
  const allConversations = useMemo(() => {
    return convData?.pages.flatMap(page => page.data) ?? [];
  }, [convData]);

  // Handle Selection
  const handleStartSelection = (initialMessageId: string) => {
    setIsSelectionMode(true);
    setSelectedMessageIds([initialMessageId]);
  };

  const toggleMessageSelection = (messageId: string) => {
    setSelectedMessageIds(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedMessageIds([]);
  };

  const handleForwardClick = async () => {
    if (selectedMessageIds.length === 0) return;
    
    // Fetch connections if not already fetched
    if (connections.length === 0) {
        try {
            const res = await getConnections(authHeaders);
            setConnections(res.data);
        } catch (error) {
            console.error("Failed to fetch connections", error);
        }
    }
    
    setIsForwardModalOpen(true);
  };

  const handleForwardMessages = async (targetConversationIds: string[]) => {
    try {
        const results = await forwardMessages(selectedMessageIds, targetConversationIds, authHeaders);
        
        // Optimistically update caches for each target conversation
        results.forEach((msg: Message) => {
            const queryKey = queryKeys.chat.messages.list(msg.conversationId);
            queryClient.setQueryData<InfiniteData<GetMessagesResponse>>(queryKey, (oldData) => {
                if (!oldData) return oldData;
                const newPages = [...oldData.pages];
                if (newPages.length > 0) {
                    // Check for duplicates
                    const exists = newPages.some(page => page.messages?.some(m => m.id === msg.id));
                    if (!exists && newPages[0].messages) {
                        newPages[0] = {
                            ...newPages[0],
                            messages: [msg, ...newPages[0].messages]
                        };
                    }
                }
                return { ...oldData, pages: newPages };
            });
        });

        // Invalidate conversation list to update previews
        queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });

        handleCancelSelection();
        setIsForwardModalOpen(false);
    } catch (error) {
        console.error("Forwarding failed", error);
        throw error;
    }
  };

  // Fetch pinned messages when conversation changes
  useEffect(() => {
    if (conversation?.conversationId && !conversation.conversationId.startsWith('temp-') && !conversation.conversationId.startsWith('optimistic-')) {
      getPinnedMessages(conversation.conversationId, authHeaders)
        .then(setPinnedMessages)
        .catch(err => console.error("Failed to fetch pinned messages", err));
        
      setPinnedMessages([]); // Reset while fetching
    }
  }, [conversation?.conversationId, authHeaders]); // Add authHeaders dependency

  // WebSocket listeners for pinning
  useEffect(() => {
    if (!conversation?.conversationId) return;

    const handlePinUpdate = (event: Event) => {
        const customEvent = event as CustomEvent;
        const data = customEvent.detail;
        
        console.log("ChatWindow received pin update:", data);

        // Check conversation match (data usually has 'conversationId' or nested in 'data')
        const targetConvId = data.conversationId || data.data?.conversationId;
        
        if (targetConvId !== conversation.conversationId) return;

        if (data.type === 'message_pinned') {
            const newMessage = data.data || data; // Handle likely nesting
            setPinnedMessages(prev => {
                const exists = prev.find(p => p.id === newMessage.id);
                if (exists) return prev;
                return [...prev, newMessage];
            });
        } else if (data.type === 'message_unpinned') {
             const msgId = data.messageId || data.data?.messageId;
             setPinnedMessages(prev => prev.filter(p => p.id !== msgId));
        }
    };

    window.addEventListener('chat:pin_update', handlePinUpdate);
    return () => window.removeEventListener('chat:pin_update', handlePinUpdate);
  }, [conversation?.conversationId]);

  // Scroll to pinned message
  const handlePinClick = (messageId: string) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-yellow-100/20');
      setTimeout(() => el.classList.remove('bg-yellow-100/20'), 2000);
    } else {
      console.log("Message not in view");
    }
  };
  
  const handleUnpin = async (messageId: string) => {
      try {
          setPinnedMessages(prev => prev.filter(p => p.id !== messageId));
          if (conversation?.conversationId) {
              await unpinMessage(conversation.conversationId, messageId, authHeaders); // Pass headers
          }
      } catch (error) {
          console.error("Failed to unpin", error);
      }
  };

  const handleUnblock = async () => {
      const otherParticipant = conversation?.participants.find(p => p.userId !== currentUserId);
      if (!otherParticipant || !conversation || isUnblocking) return;

      setIsUnblocking(true);

      try {
          await unblockUser(otherParticipant.userId, authHeaders);
          toast.success("User unblocked");
          
          // Switch UI to unblocked state using event ONLY on success
          window.dispatchEvent(new CustomEvent('chat:block_updated', {
              detail: {
                  conversationId: conversation.conversationId,
                  isBlockedByMe: false,
                  isBlockedByThem: conversation.isBlockedByThem ?? false,
              }
          }));

          // Invalidate messages list to clear old system messages (blocked) 
          // and show the new 'unblocked' system message
          queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages.list(conversation.conversationId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
      } catch(error) {
          console.error("Failed to unblock", error);
          toast.error("Failed to unblock user");
      } finally {
          setIsUnblocking(false);
      }
  };

  const handleDeleteChat = async () => {
      if (!conversation?.conversationId) return;
      
      try {
          await softDeleteConversation(conversation.conversationId, authHeaders);
          toast.success("Chat deleted");
          onConversationDeleted?.();
          queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
      } catch (error) {
          console.error("Failed to delete chat", error);
          toast.error("Failed to delete chat");
      }
  };

  // Track the last read receipt we sent to prevent the infinite loop:
  // sendReadReceipt → backend emits message_status_updated → messages cache updates → effect fires again
  const lastSentReadReceiptRef = useRef<string | null>(null);

  // Send read receipt when new messages arrive — guarded by ref deduplication
  useEffect(() => {
    if (!conversation?.conversationId || !messages.length || !isConnected) return;

    const lastIncomingMessage = messages.find(
        msg => msg.senderId !== currentUserId
    );

    if (
      lastIncomingMessage &&
      lastIncomingMessage.status !== 'READ' &&
      lastIncomingMessage.status !== 'read' &&
      lastIncomingMessage.id !== lastSentReadReceiptRef.current // ✅ Only send if not already sent
    ) {
        lastSentReadReceiptRef.current = lastIncomingMessage.id;
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

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);

    if (scrollTop === 0 && hasMoreMessages && onLoadMore && !isLoadingMessages) {
      onLoadMore();
    }
  };

  // --- handlers for message actions ---
  const handleReply = (message: Message) => {
    setReplyingTo(message);
    setEditingMessage(null); // Clear edit mode if replying
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setReplyingTo(null); // Clear reply mode if editing
  };
  
  const handleCancelReply = () => {
    setReplyingTo(null);
  }

  const handleCancelEdit = () => {
    setEditingMessage(null);
  }

  // NOTE: Logic for delete, react, pin etc. will be passed to MessageList -> MessageBubble
  // The actual API calls should happen here or be passed from the parent page if using a hook
  // Assuming ChatWindow props might need to be expanded OR we use the service directly here.
  // For now, I'll assume we pass generic handlers or use a service hook if available.
  // Since we don't have those props yet, I'll temporarily define them here calling the service directly? 
  // No, better to stick to the pattern. I'll import the service functions here for now or expect them passed?
  // The prompt said "Client Chat UX Wiring". I should wire them up.
  // I'll import the service methods I just added.
  
  // Wait, I can't import `chat.service` directly inside a client component if it uses logic that assumes... 
  // actually `chat.service.ts` uses `axiosInstance`, so it is fine.

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
    <div className="flex flex-row flex-1 bg-background h-full overflow-hidden">
      {/* Left Main Column: Chat Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <ChatHeader 
          conversation={conversation}
          currentUserId={currentUserId}
          isConnected={isConnected}
          onViewInfo={() => setShowDetails(prev => !prev)}
        />

        {/* Pinned Messages Bar */}
        {pinnedMessages.length > 0 && (
          <PinnedMessageBar 
            message={pinnedMessages[pinnedMessages.length - 1]}
            count={pinnedMessages.length}
            onUnpin={handleUnpin}
            onClick={handlePinClick}
            canUnpin={true} 
          />
        )}

        {/* Messages Scroll Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-0 relative"
        >
          {/* WhatsApp Background Pattern */}
          <div className="absolute inset-0 bg-[#efeae2] z-0" />
          <div 
              className="absolute inset-0 opacity-[0.05] pointer-events-none z-[1]" 
              style={{ 
                  backgroundImage: 'url("https://w0.peakpx.com/wallpaper/508/606/HD-wallpaper-whatsapp-l-light-pattern.jpg")', 
                  backgroundSize: '460px' 
              }} 
          />

          <div className="relative z-10 px-6 py-4 flex flex-col min-h-full">
              {/* Load More Indicator */}
              {hasMoreMessages && (
                <div className="flex justify-center py-2 mb-4">
                  {isLoadingMessages ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onLoadMore}
                      className="text-muted-foreground hover:text-foreground bg-white/20 backdrop-blur-sm"
                    >
                      Load more messages
                    </Button>
                  )}
                </div>
              )}

              {/* Empty State */}
              {messages.length === 0 && !isLoadingMessages && (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground min-h-[300px]">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-border/50 text-center max-w-sm">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
                  </div>
                </div>
              )}

              {/* Skeleton Loading */}
              {messages.length === 0 && isLoadingMessages && (
                  <div className="flex-1 flex flex-col gap-4">
                      <ChatWindowSkeleton />
                  </div>
              )}

              {/* Messages List */}
              <div className="flex flex-col-reverse gap-1">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const isGroup = conversation?.type === 'GROUP';
                  
                  // System Message Rendering
                  if (message.type as string === 'SYSTEM') {
                      return (
                          <div key={message.id} className="flex justify-center my-6 animate-in fade-in zoom-in-95 duration-500">
                              <div className="bg-white/40 backdrop-blur-[2px] text-zinc-500 dark:text-zinc-400 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-sm border border-white/40 uppercase tracking-widest flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-zinc-400" />
                                  {formatSystemMessage(message.content, conversation.participants, currentUserId)}
                                  <div className="w-1 h-1 rounded-full bg-zinc-400" />
                              </div>
                          </div>
                      );
                  }

                  // Participant Data for Avatar/Name
                  const senderParticipant = !message.sender && isGroup
                      ? conversation?.participants.find((p) => p.userId === message.senderId)
                      : null;
                  
                  const senderName = (isOwn || !isGroup)
                      ? undefined 
                      : message.sender?.username || senderParticipant?.username || 'Unknown';
                      
                  const senderAvatar = (isOwn || !isGroup)
                      ? undefined
                      : message.sender?.profileImage || senderParticipant?.profilePhoto || undefined;

                  // Sequence and Block Logic
                  const previousMessage = messages[index - 1];
                  const isFirstInSequence = (!previousMessage || previousMessage.senderId !== message.senderId) && message.type !== 'SYSTEM';
                  const showAvatar = isGroup && isFirstInSequence && !!senderAvatar;
                  const isBlocked = conversation?.isBlockedByMe || conversation?.isBlockedByThem;

                  return (
                      <div key={message.id} id={`message-${message.id}`}>
                          <MessageBubble
                              message={message}
                              isOwn={isOwn}
                              showAvatar={showAvatar}
                              senderName={senderName}
                              senderAvatar={senderAvatar}
                              onReply={handleReply}
                              onEdit={handleEdit}
                              onForward={() => handleStartSelection(message.id)}
                              onSelect={() => toggleMessageSelection(message.id)}
                              isSelected={selectedMessageIds.includes(message.id)}
                              selectionMode={isSelectionMode}
                              isBlocked={isBlocked}
                          />
                      </div>
                  );
                })}
              </div>
              {/* Scroll Anchor */}
              <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="z-10 bg-background border-t border-border">
          {conversation.isBlockedByMe ? (
            <div className="w-full bg-[#f0f2f5] flex items-center justify-center h-[60px] shrink-0">
              <Button
                variant="link"
                onClick={handleDeleteChat}
                className="text-[#ea0038] hover:no-underline font-bold text-xs px-6 h-full flex-1 uppercase tracking-wider"
              >
                Delete chat
              </Button>
              <div className="w-[1px] h-6 bg-border/60" />
              <Button
                variant="link"
                onClick={handleUnblock}
                disabled={isUnblocking}
                className="text-[#00a884] hover:no-underline font-bold text-xs px-6 h-full flex-1 uppercase tracking-wider relative"
              >
                {isUnblocking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    "Unblock"
                )}
              </Button>
            </div>
          ) : conversation.isBlockedByThem ? (
            <div className="w-full bg-[#f0f2f5] flex items-center justify-center h-[60px] shrink-0">
              <p className="text-[13px] text-gray-500 font-medium">
                You can't send messages to this user
              </p>
            </div>
          ) : (
            (() => {
              const isGroup = conversation.type === 'GROUP';
              const myParticipant = conversation.participants.find(p => p.userId === currentUserId);
              const isAdmin = myParticipant?.role === 'ADMIN' || conversation.ownerId === currentUserId;
              const canPost = !isGroup || !conversation.onlyAdminsCanPost || isAdmin;
              const disabled = !isConnected || !canPost;
              const placeholder = !canPost ? 'Only admins can send messages' : 'Type a message...';
              return (
                <ChatInput
                  conversationId={conversation.conversationId}
                  disabled={disabled}
                  placeholder={placeholder}
                  replyingTo={replyingTo}
                  editingMessage={editingMessage}
                  onCancelReply={handleCancelReply}
                  onCancelEdit={handleCancelEdit}
                />
              );
            })()
          )}
        </div>

        {/* Selection Bar Overlay (Relative to chat area) */}
        {isSelectionMode && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-background/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl px-6 py-3 flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{selectedMessageIds.length} selected</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Message Actions</span>
            </div>
            <div className="h-8 w-[1px] bg-border mx-2" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleCancelSelection} className="h-10 w-10 rounded-full hover:bg-muted">
                <X className="h-5 w-5" />
              </Button>
              <Button 
                variant="default" 
                onClick={handleForwardClick} 
                disabled={selectedMessageIds.length === 0}
                className="rounded-full px-6 gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all font-semibold"
              >
                <Forward className="h-4 w-4" />
                Forward
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Profile Panel */}
      {showDetails && conversation && (
        <div className="w-[380px] h-full z-20 border-l bg-background animate-in slide-in-from-right duration-300 overflow-hidden flex flex-col">
          <ProfilePanel 
              conversation={conversation} 
              currentUserId={currentUserId}
              onClose={() => setShowDetails(false)}
              onConversationDeleted={onConversationDeleted}
          />
        </div>
      )}

      {/* Forward Modal */}
      <ForwardModal
        isOpen={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        onForward={handleForwardMessages}
        conversations={allConversations}
        connections={connections}
        selectedMessages={messages.filter(m => selectedMessageIds.includes(m.id))}
      />
    </div>
  );
}
