/**
 * Chat Service
 * Handles all REST API calls to the chat service via API Gateway
 */

import axios from 'axios';
import {
  GetConversationsResponse,
  GetMessagesResponse,
  SendMessagePayload,
  SendMessageResponse,
  Conversation,
} from '@/src/types/chat.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const CHAT_API_BASE = `${API_BASE_URL}/api/v1/chat`;

/**
 * Get user's conversations
 */
export async function getConversations(
  token: string,
  limit = 50,
  offset = 0
): Promise<GetConversationsResponse> {
  try {
    const response = await axios.get<GetConversationsResponse>(
      `${CHAT_API_BASE}/conversations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit, offset },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    throw error;
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  token: string,
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<GetMessagesResponse> {
  try {
    const response = await axios.get<GetMessagesResponse>(
      `${CHAT_API_BASE}/conversations/${conversationId}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit, offset },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }
}

/**
 * Send a message (REST fallback - WebSocket is preferred)
 */
export async function sendMessage(
  token: string,
  payload: SendMessagePayload
): Promise<SendMessageResponse> {
  try {
    const response = await axios.post<SendMessageResponse>(
      `${CHAT_API_BASE}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

/**
 * Get conversation by ID
 */
export async function getConversationById(
  token: string,
  conversationId: string
): Promise<Conversation> {
  try {
    const response = await axios.get<Conversation>(
      `${CHAT_API_BASE}/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch conversation:', error);
    throw error;
  }
}

/**
 * Mark messages as read
 */
export async function markAsRead(
  token: string,
  conversationId: string
): Promise<void> {
  try {
    await axios.post(
      `${CHAT_API_BASE}/conversations/${conversationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error('Failed to mark as read:', error);
    // Don't throw - this is not critical
  }
}
