import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";
import {
  Conversation,
  Message,
  CreateConversationInput,
  SendMessageInput,
  GetMessagesParams,
} from "@/src/app/types/chat";
/**
 * Chat API Service
 * Follows your existing pattern - accepts headers parameter
 */
export const getUserConversations = async (
  headers: Record<string, string>
): Promise<Conversation[]> => {
  const res = await axiosInstance.get(API_ROUTES.CHAT.CONVERSATIONS, {
    headers,
  });
  return res.data.data || [];
};
export const getConversationMessages = async (
  conversationId: string,
  params: GetMessagesParams,
  headers: Record<string, string>
): Promise<Message[]> => {
  const res = await axiosInstance.get(
    API_ROUTES.CHAT.CONVERSATION_MESSAGES(conversationId),
    {
      params,
      headers,
    }
  );
  return res.data.data || [];
};
export const createConversation = async (
  data: CreateConversationInput,
  headers: Record<string, string>
): Promise<Conversation> => {
  const res = await axiosInstance.post(
    API_ROUTES.CHAT.CONVERSATIONS,
    data,
    { headers }
  );
  return res.data.data;
};
export const sendMessage = async (
  conversationId: string,
  data: SendMessageInput,
  headers: Record<string, string>
): Promise<Message> => {
  const res = await axiosInstance.post(
    API_ROUTES.CHAT.SEND_MESSAGE(conversationId),
    data,
    { headers }
  );
  return res.data.data;
};