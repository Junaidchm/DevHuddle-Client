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
  role?: 'ADMIN' | 'MEMBER';
}

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'STICKER' | 'SYSTEM' | 'CHAT_IMAGE' | 'CHAT_VIDEO' | 'CHAT_AUDIO' | 'CHAT_FILE';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User; // Populated for group/hub chats
  content: string;
  type: MessageType;
  
  // Media fields
  mediaUrl?: string;
  mediaId?: string;
  mediaMimeType?: string;
  mediaSize?: number;
  mediaName?: string;
  mediaDuration?: number;

  createdAt: string;
  updatedAt?: string;
  
  // Status
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  deliveredAt?: string;
  readAt?: string;
  
  // Optimistic updates
  dedupeId?: string;

  // WhatsApp Features
  isForwarded?: boolean;
  forwardedFrom?: string;
  replyToId?: string;
  replyTo?: Message;
  formattedContent?: string;
  isStarred?: boolean;
  isPinned?: boolean;

  // Reactions
  reactions?: MessageReaction[];

  // Deletion
  deletedForAll?: boolean;
  deletedFor?: string[];
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  // ✅ FIX: Add missing fields used by ChatHeader
  type?: 'DIRECT' | 'GROUP';
  name?: string;
  description?: string;
  icon?: string;
  ownerId?: string;
  
  // Permissions
  onlyAdminsCanPost?: boolean;
  onlyAdminsCanEditInfo?: boolean;

  // Hubs feature
  topics?: string[];

  lastMessageAt?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount?: number;
}
// ...
export interface ConversationWithMetadata {
  conversationId: string;
  type: 'DIRECT' | 'GROUP';
  name?: string;
  icon?: string;
  description?: string;
  ownerId?: string;
  // Group permissions
    onlyAdminsCanPost?: boolean;
    onlyAdminsCanEditInfo?: boolean;
    memberCount?: number;

  // Block states
  isBlockedByMe?: boolean;
  isBlockedByThem?: boolean;

  // Hubs feature
  topics?: string[];

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
  createdAt: string;
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
  | 'ping' 
  | 'pong'
  | 'message_pinned'
  | 'message_unpinned' 
  | 'reaction_added'
  | 'reaction_removed'
  | 'message_deleted'
  // Notification types
  | 'new_notification'
  | 'unread_count'
  // Call types
  | 'call:start'
  | 'call:join'
  | 'call:signal'
  | 'call:leave'
  | 'call:end'
  | 'call:toggle_media'
  | 'call:incoming'
  | 'call:participant_joined'
  | 'call:participant_left'
  | 'call:ended'
  | 'call:participants'
  | 'call:media_toggled'
  | 'call:media_toggled'
  | 'presence_change'
  | 'USER_BLOCKED'
  | 'USER_UNBLOCKED'
  // Group Types
  | 'group_created'
  | 'group_updated'
  | 'group_deleted'
  | 'participants_added'
  | 'participant_joined'
  | 'participant_removed'
  | 'participant_left'
  | 'role_updated';

export interface WebSocketMessage<T = unknown> {
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
  // Call specific fields
  isVideoCall?: boolean;
  targetUserId?: string;
  targetUserIds?: string[]; // For selective ringing in group calls
  callId?: string; // DB Call ID
  signalType?: 'offer' | 'answer' | 'ice-candidate';
  signalData?: unknown;
  mediaType?: 'audio' | 'video' | 'screen';
  isEnabled?: boolean;
  callScope?: 'ONE_TO_ONE' | 'GROUP';
  groupName?: string;
  groupAvatar?: string | null;
}

/**
 * API Response Types
 */
// Participant with user profile
export interface ConversationParticipant {
  userId: string;
  username: string;
  name: string;
  profilePhoto: string | null;
  role?: 'ADMIN' | 'MEMBER';
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

// Check conversation response
export interface CheckConversationResponse {
  success: boolean;
  data: {
    exists: boolean;
    conversationId?: string;
  };
}

export interface GetMessagesResponse {
  success?: boolean; 
  data?: Message[];
  messages?: Message[]; 
  pagination?: {
      limit: number;
      nextCursor?: string | null;
      count: number;
  };
  hasMore?: boolean; 
}

export interface SendMessagePayload {
  recipientIds: string[];
  content: string;
}

export interface SendMessageResponse {
  message: Message;
  conversationId: string;
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

// Lightweight DTO for Hubs discovery
export interface GroupListDto {
  conversationId: string;
  name: string | null;
  description: string | null;
  icon: string | null;
  memberCount: number;
  topics: string[];
  isMember: boolean;
  isRequestPending: boolean;
  createdAt: Date;
}