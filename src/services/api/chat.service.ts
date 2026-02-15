import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";
import {
  GetConversationsResponse,
  GetMessagesResponse,
  SendMessageResponse,
  Conversation,
  CheckConversationResponse,
  ConversationWithMetadata,
} from '@/src/types/chat.types';

/**
 * Get user's conversations
 */
export async function getConversations(
  headers: Record<string, string>,
  limit = 50,
  offset = 0
): Promise<GetConversationsResponse> {
  try {
    const response = await axiosInstance.get<GetConversationsResponse>(
      API_ROUTES.CHAT.CONVERSATIONS,
      {
        headers,
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
  conversationId: string,
  headers: Record<string, string>,
  limit = 50,
  before?: Date
): Promise<GetMessagesResponse> {
  try {
    const response = await axiosInstance.get<GetMessagesResponse>(
      API_ROUTES.CHAT.CONVERSATION_MESSAGES(conversationId),
      {
        headers,
        params: { 
            limit, 
            before: before?.toISOString() // Send as ISO string
        },
      }
    );
    console.log(`[API] getMessages response data:`, response.data); 
    console.log(`[API] getMessages fetched ${response.data.messages?.length} messages for conv ${conversationId}`);
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
  conversationId: string,
  content: string,
  headers: Record<string, string>
): Promise<SendMessageResponse> {
  try {
     const response = await axiosInstance.post<SendMessageResponse>(
      API_ROUTES.CHAT.SEND_MESSAGE(conversationId),
      { content },
      { headers }
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
  conversationId: string,
  headers: Record<string, string>
): Promise<Conversation> {
  try {
    const response = await axiosInstance.get<Conversation>(
      API_ROUTES.CHAT.CONVERSATION_BY_ID(conversationId),
      { headers }
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
  conversationId: string,
  headers: Record<string, string>
): Promise<void> {
  try {
     await axiosInstance.post(
      API_ROUTES.CHAT.CONVERSATION_BY_ID(conversationId) + '/read',
      {},
      { headers }
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

/**
 * Check if conversation exists
 */
export async function checkConversationExists(
  participantIds: string[],
  headers: Record<string, string>
): Promise<CheckConversationResponse> {
  const response = await axiosInstance.post<CheckConversationResponse>(
    API_ROUTES.CHAT.CHECK_CONVERSATION,
    { participantIds },
    { headers }
  );
  return response.data;
}

/**
 * Create conversation
 */
export async function createConversation(
  participantIds: string[],
  headers: Record<string, string>
): Promise<{ success: boolean; data: Conversation }> {
  const response = await axiosInstance.post(
    API_ROUTES.CHAT.CONVERSATIONS,
    { participantIds },
    { headers }
  );
  return response.data;
}
/**
 * Mark conversation as read (updates lastReadAt timestamp, clears unread count)
 */
export async function markConversationAsRead(
  conversationId: string,
  headers: Record<string, string>
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axiosInstance.post(
      `/chat/conversations/${conversationId}/read`,
      {},
      { headers }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to mark conversation as read:', error);
    throw error;
  }
}

/**
 * Create a new group conversation
 */
export async function createGroup(
  name: string,
  participantIds: string[],
  icon?: string,
  topics?: string[],
  headers?: Record<string, string>
): Promise<Conversation> {
  const response = await axiosInstance.post<Conversation>(
      API_ROUTES.CHAT.GROUPS,
      { name, participantIds, icon, topics },
      { headers }
  );
  return response.data;
}

export async function getAllGroups(
    params: { query?: string; topics?: string[]; limit?: number; offset?: number },
    headers?: Record<string, string>
): Promise<ConversationWithMetadata[]> {
    const response = await axiosInstance.get<ConversationWithMetadata[]>(
        API_ROUTES.CHAT.GROUPS,
        { 
            headers,
            params: {
              ...params,
              topics: params.topics // Axios handles array params properly usually, or we might need serialization
            }
        }
    );
    return response.data;
}

export async function joinGroup(groupId: string, userIds: string[], headers?: Record<string, string>): Promise<void> {
    // Use the new /join endpoint for self-joining groups
    await axiosInstance.post(`${API_ROUTES.CHAT.GROUPS}/${groupId}/join`, {}, { headers });
}

export async function addParticipants(groupId: string, userIds: string[], headers?: Record<string, string>): Promise<void> {
    await axiosInstance.post(`${API_ROUTES.CHAT.GROUPS}/${groupId}/participants`, { userIds }, { headers });
}

export async function removeParticipant(groupId: string, userId: string, headers?: Record<string, string>): Promise<void> {
    await axiosInstance.delete(`${API_ROUTES.CHAT.GROUPS}/${groupId}/participants/${userId}`, { headers });
}

export async function promoteToAdmin(groupId: string, userId: string, headers?: Record<string, string>): Promise<void> {
    await axiosInstance.post(`${API_ROUTES.CHAT.GROUPS}/${groupId}/admins/${userId}`, {}, { headers });
}

export async function demoteToMember(groupId: string, userId: string, headers?: Record<string, string>): Promise<void> {
    await axiosInstance.delete(`${API_ROUTES.CHAT.GROUPS}/${groupId}/admins/${userId}`, { headers });
}

export async function updateGroupInfo(
    groupId: string, 
    data: { 
        name?: string; 
        description?: string; 
        icon?: string;
        onlyAdminsCanPost?: boolean;
        onlyAdminsCanEditInfo?: boolean;
    }, 
    headers?: Record<string, string>
): Promise<Conversation> {
    const response = await axiosInstance.put<Conversation>(`${API_ROUTES.CHAT.GROUPS}/${groupId}`, data, { headers });
    return response.data;
}

export async function leaveGroup(groupId: string, headers?: Record<string, string>): Promise<void> {
    await axiosInstance.post(`${API_ROUTES.CHAT.GROUPS}/${groupId}/leave`, {}, { headers });
}

export async function deleteGroup(groupId: string, headers?: Record<string, string>): Promise<void> {
    await axiosInstance.delete(API_ROUTES.CHAT.GROUP_DELETE(groupId), { headers });
}
