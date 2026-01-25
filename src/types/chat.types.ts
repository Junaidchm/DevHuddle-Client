/**
 * Chat System Type Definitions
 * Matches backend schema and WebSocket protocol
 */

export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  isOnline?: boolean;
}

export interface Participant {
  userId: string;
  conversationId: string;
  createdAt: string;
  lastReadAt: string;
  user?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export interface Conversation {
  id: string;
  createdAt: string;
  lastMessageAt?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount?: number;
}

/**
 * WebSocket Message Types
 */
export type WebSocketMessageType =
  | 'auth'
  | 'auth_success'
  | 'auth_error'
  | 'send_message'
  | 'new_message'
  | 'message_sent'
  | 'message_delivered'
  | 'message_read'
  | 'message_status_updated'
  | 'typing'
  | 'stop_typing'
  | 'error'
  | 'heartbeat'
  | 'heartbeat_ack'
  // Notification types
  | 'new_notification'
  | 'unread_count';

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  data?: T;
  token?: string;
  recipientIds?: string[];
  content?: string;
  error?: string;
  message?: string;
  // Chat specific fields
  conversationId?: string;
  dedupeId?: string;
  messageId?: string;
  lastReadMessageId?: string;
  event?: string; // Legacy support
}

/**
 * API Response Types
 */
export interface GetConversationsResponse {
  conversations: Conversation[];
  total: number;
}

export interface GetMessagesResponse {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export interface SendMessagePayload {
  recipientIds: string[];
  content: string;
}

export interface SendMessageResponse {
  message: Message;
  conversationId: string;
}


// Participant with user profile
export interface ConversationParticipant {
  userId: string;
  username: string;
  name: string;
  profilePhoto: string | null;
}
// Enriched conversation with metadata
export interface ConversationWithMetadata {
  conversationId: string;
  participantIds: string[];
  participants: ConversationParticipant[];
  lastMessage: {
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  } | null;
  lastMessageAt: string;
  unreadCount: number;
}
// Check conversation response
export interface CheckConversationResponse {
  success: boolean;
  data: {
    exists: boolean;
    conversationId?: string;
  };
}
// Updated GetConversationsResponse
export interface GetConversationsResponse {
  success: boolean;
  data: ConversationWithMetadata[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}