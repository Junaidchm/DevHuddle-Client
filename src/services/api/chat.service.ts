import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";
import {
  GetConversationsResponse,
  GetMessagesResponse,
  SendMessagePayload,
  SendMessageResponse,
  Conversation,
} from '@/src/types/chat.types';

/**
 * Get user's conversations
 */
export async function getConversations(
  token: string,
  limit = 50,
  offset = 0
): Promise<GetConversationsResponse> {
  try {
    const response = await axiosInstance.get<GetConversationsResponse>(
      API_ROUTES.CHAT.CONVERSATIONS,
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
    const response = await axiosInstance.get<GetMessagesResponse>(
      API_ROUTES.CHAT.CONVERSATION_MESSAGES(conversationId),
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
  conversationId: string,
  content: string
): Promise<SendMessageResponse> {
  try {
     const response = await axiosInstance.post<SendMessageResponse>(
      API_ROUTES.CHAT.SEND_MESSAGE(conversationId),
      { content },
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
    const response = await axiosInstance.get<Conversation>(
      API_ROUTES.CHAT.CONVERSATION_BY_ID(conversationId),
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
    // Note: API_ROUTES.CHAT does not currently have a MARK_READ specific to conversation
    // Assuming it to be added or using a placeholder
    // For now, I will comment this out or use a direct string to avoid breaking if API route is missing
    // But better to stick to what was there.
    /*
    await axiosInstance.post(
      `${API_ROUTES.CHAT.CONVERSATIONS}/${conversationId}/read`, 
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    */
     await axiosInstance.post(
      API_ROUTES.CHAT.CONVERSATION_BY_ID(conversationId) + '/read',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
}

/**
 * Get chat suggestions (LinkedIn style)
 * Returns weighted suggestions based on interactions and profile completeness
 */
export const getChatSuggestions = async (headers: Record<string, string>) => {
  try {
    const response = await axiosInstance.get(API_ROUTES.USERS.CHAT_SUGGESTIONS, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching chat suggestions:", error);
    throw error;
  }
};
