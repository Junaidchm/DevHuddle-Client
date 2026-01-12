/**
 * Chat Page
 * Main entry point for the chat application
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Components
import ChatSidebar from '@/src/components/chat/ChatSidebar';
import ChatWindow from '@/src/components/chat/ChatWindow';

// Services & Hooks
import { getConversations, getMessages } from '@/src/services/chat.service';
import { useWebSocket } from '@/src/hooks/useWebSocket';

// Types
import {
  Conversation,
  Message,
  WebSocketMessage,
} from '@/src/types/chat.types';
import toast from 'react-hot-toast';

// ============================================
// MOCK DATA FOR UI DEMONSTRATION
// ============================================
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    participants: [
      {
        userId: 'current-user',
        conversationId: 'conv-1',
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      },
      {
        userId: 'user-1',
        conversationId: 'conv-1',
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
        user: {
          id: 'user-1',
          username: 'Sarah Chen',
          email: 'sarah@example.com',
          profileImage: 'https://i.pravatar.cc/150?img=5',
          isOnline: true,
        },
      },
    ],
    lastMessage: {
      id: 'msg-1-5',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: "That sounds great! Let's do it 🚀",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    unreadCount: 2,
  },
  {
    id: 'conv-2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    participants: [
      {
        userId: 'current-user',
        conversationId: 'conv-2',
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      },
      {
        userId: 'user-2',
        conversationId: 'conv-2',
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
        user: {
          id: 'user-2',
          username: 'Alex Rodriguez',
          email: 'alex@example.com',
          profileImage: 'https://i.pravatar.cc/150?img=12',
          isOnline: false,
        },
      },
    ],
    lastMessage: {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      senderId: 'current-user',
      content: 'Thanks for your help!',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    unreadCount: 0,
  },
  {
    id: 'conv-3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    participants: [
      {
        userId: 'current-user',
        conversationId: 'conv-3',
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      },
      {
        userId: 'user-3',
        conversationId: 'conv-3',
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
        user: {
          id: 'user-3',
          username: 'Jamie Kim',
          email: 'jamie@example.com',
          profileImage: 'https://i.pravatar.cc/150?img=20',
          isOnline: true,
        },
      },
    ],
    lastMessage: {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      senderId: 'user-3',
      content: 'I sent you the files you needed',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    unreadCount: 1,
  },
  {
    id: 'conv-4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), // 20 hours ago
    participants: [
      {
        userId: 'current-user',
        conversationId: 'conv-4',
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      },
      {
        userId: 'user-4',
        conversationId: 'conv-4',
        createdAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
        user: {
          id: 'user-4',
          username: 'Morgan Taylor',
          email: 'morgan@example.com',
          profileImage: 'https://i.pravatar.cc/150?img=32',
          isOnline: false,
        },
      },
    ],
    lastMessage: {
      id: 'msg-4-1',
      conversationId: 'conv-4',
      senderId: 'current-user',
      content: 'See you at the meeting tomorrow!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    unreadCount: 0,
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      senderId: 'current-user',
      content: 'Hey Sarah! How are you doing?',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: "I'm doing great! Just finished the new feature for the project 🎉",
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      senderId: 'current-user',
      content: 'Awesome! Can you share the details?',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-1-4',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content:
        "Sure! I've implemented the real-time chat feature with WebSocket support. It includes typing indicators, read receipts, and message status updates. The UI is looking pretty slick too!",
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'msg-1-5',
      conversationId: 'conv-1',
      senderId: 'current-user',
      content: "That's incredible work! Want to do a demo call later?",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      status: 'delivered',
    },
    {
      id: 'msg-1-6',
      conversationId: 'conv-1',
      senderId: 'user-1',
      content: "That sounds great! Let's do it 🚀",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      senderId: 'user-2',
      content: 'Hi! I saw your question on the forum',
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'msg-2-2',
      conversationId: 'conv-2',
      senderId: 'current-user',
      content: 'Oh yes! Do you know how to fix the TypeScript error?',
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-2-3',
      conversationId: 'conv-2',
      senderId: 'user-2',
      content:
        "Yes! You need to add the type assertion. Try using 'as const' or add proper interface definitions.",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'msg-2-4',
      conversationId: 'conv-2',
      senderId: 'current-user',
      content: 'Thanks for your help!',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: 'read',
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      senderId: 'current-user',
      content: 'Hey Jamie, can you send me those design files?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-3-2',
      conversationId: 'conv-3',
      senderId: 'user-3',
      content: 'I sent you the files you needed',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ],
  'conv-4': [
    {
      id: 'msg-4-1',
      conversationId: 'conv-4',
      senderId: 'current-user',
      content: 'See you at the meeting tomorrow!',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      status: 'read',
    },
  ],
};

// Enable demo mode (set to false to use real backend)
// const DEMO_MODE = true;
const DEMO_MODE = false;

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});

  // Redirect to login if not authenticated (skip in demo mode)
  useEffect(() => {
    if (!DEMO_MODE && status === 'unauthenticated') {
      router.push('/signIn');
    }
  }, [status, router]);

  // Fetch conversations with React Query
  const {
    data: conversationsData,
    isLoading: isLoadingConversations,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      if (DEMO_MODE) {
        // Return mock data in demo mode
        return { conversations: MOCK_CONVERSATIONS, total: MOCK_CONVERSATIONS.length };
      }
      if (!session?.user?.accessToken) throw new Error('No token');
      return getConversations(session.user.accessToken);
    },
    enabled: DEMO_MODE || !!session?.user?.accessToken,
    staleTime: 30000, // 30 seconds
  });

  // Fetch messages for selected conversation
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: async () => {
      if (DEMO_MODE && selectedConversationId) {
        // Return mock messages in demo mode
        const messages = MOCK_MESSAGES[selectedConversationId] || [];
        return { messages, total: messages.length, hasMore: false };
      }
      if (!session?.user?.accessToken || !selectedConversationId) {
        throw new Error('No token or conversation');
      }
      return getMessages(session.user.accessToken, selectedConversationId);
    },
    enabled: DEMO_MODE ? !!selectedConversationId : !!session?.user?.accessToken && !!selectedConversationId,
    staleTime: 10000, // 10 seconds
  });

  // WebSocket message handler
  const handleWebSocketMessage = useCallback(
    (wsMessage: WebSocketMessage) => {
      console.log('📨 WebSocket message:', wsMessage);

      switch (wsMessage.type) {
        case 'new_message':
          // Add new message to the appropriate conversation
          if (wsMessage.data?.message) {
            const message: Message = wsMessage.data.message;
            const convId = message.conversationId;

            // Update messages in state
            setMessagesMap((prev) => ({
              ...prev,
              [convId]: [...(prev[convId] || []), message],
            }));

            // Invalidate conversations to update last message
            queryClient.invalidateQueries({ queryKey: ['conversations'] });

            // Show notification if not in current conversation
            if (convId !== selectedConversationId) {
              toast.success(`New message from ${wsMessage.data.senderName || 'someone'}`);
            }
          }
          break;

        case 'message_sent':
          // Update optimistic message with real data
          if (wsMessage.data?.message) {
            const message: Message = wsMessage.data.message;
            const convId = message.conversationId;

            setMessagesMap((prev) => {
              const existing = prev[convId] || [];
              // Replace or append
              const hasOptimistic = existing.some((m) => m.id === 'temp');
              if (hasOptimistic) {
                return {
                  ...prev,
                  [convId]: existing.map((m) =>
                    m.id === 'temp' ? message : m
                  ),
                };
              }
              return {
                ...prev,
                [convId]: [...existing, message],
              };
            });
          }
          break;

        case 'typing':
          // TODO: Handle typing indicator
          console.log('User is typing:', wsMessage.data);
          break;

        case 'stop_typing':
          // TODO: Handle stop typing
          console.log('User stopped typing:', wsMessage.data);
          break;

        case 'error':
          toast.error(wsMessage.error || 'An error occurred');
          break;
      }
    },
    [selectedConversationId, queryClient]
  );

  // Initialize WebSocket (skip in demo mode)
  const {
    isConnected,
    isAuthenticated,
    sendMessage: wsSendMessage,
    sendTyping,
    sendStopTyping,
  } = useWebSocket({
    token: DEMO_MODE ? null : (session?.user?.accessToken || null),
    onMessage: handleWebSocketMessage,
    onConnect: () => {
      console.log('✅ Connected to chat');
      toast.success('Connected to chat');
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from chat');
      toast.error('Disconnected from chat');
    },
  });

  // Update messages map when data is fetched
  useEffect(() => {
    if (messagesData?.messages && selectedConversationId) {
      setMessagesMap((prev) => ({
        ...prev,
        [selectedConversationId]: messagesData.messages,
      }));
    }
  }, [messagesData, selectedConversationId]);

  // Send message handler
  const handleSendMessage = useCallback(
    (content: string) => {
      if (!selectedConversationId || !session?.user?.id) return;

      const conversation = conversationsData?.conversations.find(
        (c) => c.id === selectedConversationId
      );
      if (!conversation) return;

      // Get recipient IDs (all participants except current user)
      const recipientIds = conversation.participants
        .filter((p) => p.userId !== session.user.id)
        .map((p) => p.userId);

      // Optimistic update
      const tempMessage: Message = {
        id: 'temp',
        conversationId: selectedConversationId,
        senderId: session.user.id,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'sending',
      };

      setMessagesMap((prev) => ({
        ...prev,
        [selectedConversationId]: [
          ...(prev[selectedConversationId] || []),
          tempMessage,
        ],
      }));

      // Send via WebSocket
      wsSendMessage(recipientIds, content);
    },
    [selectedConversationId, session, conversationsData, wsSendMessage]
  );

  // Typing handlers
  const handleTyping = useCallback(() => {
    if (selectedConversationId) {
      sendTyping(selectedConversationId);
    }
  }, [selectedConversationId, sendTyping]);

  const handleStopTyping = useCallback(() => {
    if (selectedConversationId) {
      sendStopTyping(selectedConversationId);
    }
  }, [selectedConversationId, sendStopTyping]);

  // Get current conversation
  const selectedConversation = useMemo(() => {
    return conversationsData?.conversations.find(
      (c) => c.id === selectedConversationId
    );
  }, [conversationsData, selectedConversationId]);

  // Get messages for current conversation
  const currentMessages = useMemo(() => {
    return selectedConversationId
      ? messagesMap[selectedConversationId] || []
      : [];
  }, [messagesMap, selectedConversationId]);

  // Loading state (skip in demo mode)
  if (!DEMO_MODE && status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated (skip in demo mode)
  if (!DEMO_MODE && !session?.user) {
    return null;
  }

  const currentUserId = DEMO_MODE ? 'current-user' : (session?.user?.id || 'unknown');

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 hidden md:block">
        <ChatSidebar
          conversations={conversationsData?.conversations || []}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
          currentUserId={currentUserId}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Main Chat Area */}
      <ChatWindow
        conversation={selectedConversation || null}
        messages={currentMessages}
        currentUserId={currentUserId}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onStopTyping={handleStopTyping}
        isLoadingMessages={isLoadingMessages}
        hasMoreMessages={false} // TODO: Implement pagination
        isConnected={DEMO_MODE ? true : (isConnected && isAuthenticated)}
      />
    </div>
  );
}
