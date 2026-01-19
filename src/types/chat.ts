export interface Participant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: Date;
  user?: {
    id: string;
    username: string;
    fullName: string;
    profilePhoto?: string;
  };
}
export interface Conversation {
  id: string;
  createdAt: Date;
  lastMessageAt?: Date;
  participants: Participant[];
  // Frontend computed fields
  otherUser?: {
    id: string;
    username: string;
    fullName: string;
    profilePhoto?: string;
    isOnline?: boolean;
  };
  lastMessage?: string;
  unreadCount?: number;
}
export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: Date;
  readAt?: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}
export interface CreateConversationInput {
  participantIds: string[];
}
export interface SendMessageInput {
  content: string;
}
export interface GetMessagesParams {
  limit?: number;
  offset?: number;
}

/**
 * Chat suggestion user (LinkedIn-style)
 */
export interface ChatSuggestionUser {
  id: string;
  username: string;
  fullName: string;
  profilePhoto?: string;
  bio?: string;
  skills?: string[];
}

/**
 * Chat suggestions response
 */
export interface ChatSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: ChatSuggestionUser[];
    total: number;
  };
}