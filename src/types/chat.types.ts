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
  | 'typing'
  | 'stop_typing'
  | 'error'
  | 'heartbeat'
  | 'heartbeat_ack';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  data?: any;
  token?: string;
  recipientIds?: string[];
  content?: string;
  error?: string;
  message?: string;
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
