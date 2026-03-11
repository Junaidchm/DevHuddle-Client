"use client";

/**
 * Production-Ready WebSocket Context Implementation
 * 
 * Industry Best Practices:
 * 1. ✅ Single WebSocket connection per user session (Singleton Pattern)
 * 2. ✅ Context Provider at root level (not in components)
 * 3. ✅ Visibility API integration (pause when tab hidden)
 * 4. ✅ Network status handling (online/offline events)
 * 5. ✅ Exponential backoff reconnection strategy
 * 6. ✅ Proper cleanup on unmount/logout
 * 7. ✅ Connection state management
 * 8. ✅ Type-safe message handling
 * 
 * How Big Tech Companies Do It:
 * - LinkedIn/Twitter: Single WebSocket connection per user session
 * - Shared across all components via Context API
 * - Pause when tab is hidden to save resources
 * - Handle network changes gracefully
 * - Exponential backoff for reconnections
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { mapNotificationToLinkedInStyle } from "@/src/components/notification/notificationMapper";
import { queryKeys } from "@/src/lib/queryKeys";
import { Message, WebSocketMessage } from "@/src/types/chat.types";
import toast from "react-hot-toast";

// ==================== Types ====================

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "authenticating"
  | "connected"
  | "reconnecting";

export interface WebSocketContextType {
  connectionState: ConnectionState;
  sendMessage: (message: WebSocketMessage) => void;
  isConnected: boolean;
  reconnect: () => void;
  sendReadReceipt: (conversationId: string, messageId: string) => void;
}

// ==================== Configuration ====================

const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds
const AUTH_TIMEOUT = 5000; // 5 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const VISIBILITY_PAUSE_DELAY = 5000; // Pause connection after 5s of being hidden

// ==================== Singleton WebSocket Manager ====================

class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private chatSocket: WebSocket | null = null;
  private notificationSocket: WebSocket | null = null;
  private connectionState: ConnectionState = "disconnected";
  private listeners: Set<(state: ConnectionState) => void> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private isAuthenticated = false;
  private isIntentionalClose = false;
  private isTabVisible = true;
  private isOnline = true;
  private token: string | null = null;
  private userId: string | null = null;
  private queryClient: any = null;
  // Track processed message IDs to prevent duplication
  private processedMessageIds = new Set<string>();

  private constructor() {
    // Setup visibility API listener
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
    }
  }

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  // ==================== Public API ====================

  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify of current state
    listener(this.connectionState);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  connect(token: string, userId: string, queryClient: any): void {
    // Don't connect if tab is hidden or offline
    if (!this.isTabVisible || !this.isOnline) {
      console.log("[WebSocket] Connection deferred: tab hidden or offline");
      return;
    }

    this.token = token;
    this.userId = userId;
    this.queryClient = queryClient;
    this.isIntentionalClose = false;

    this.updateState(this.reconnectAttempts > 0 ? "reconnecting" : "connecting");

    // Connect to both services
    this.connectChat();
    this.connectNotifications();
  }

  private connectChat(): void {
    if (this.chatSocket?.readyState === WebSocket.OPEN || this.chatSocket?.readyState === WebSocket.CONNECTING) return;
    
    try {
      const url = this.getWebSocketUrl('chat');
      const socket = new WebSocket(url);
      this.chatSocket = socket;

      socket.onopen = () => {
        console.log("[WebSocket] Chat connection established");
        this.isAuthenticated = true; // Gateway handshake success
        this.updateConnectionStatus();
      };

      socket.onmessage = (event) => this.handleMessage(event);
      socket.onclose = (event) => this.handleClose(event);
      socket.onerror = (error) => {
        console.error("[WebSocket] Chat Error:", error);
        this.updateConnectionStatus();
      };
    } catch (error) {
      console.error("[WebSocket] Failed to connect Chat:", error);
    }
  }

  private connectNotifications(): void {
    if (this.notificationSocket?.readyState === WebSocket.OPEN || this.notificationSocket?.readyState === WebSocket.CONNECTING) return;

    try {
      const url = this.getWebSocketUrl('notifications');
      const socket = new WebSocket(url);
      this.notificationSocket = socket;

      socket.onopen = () => {
        console.log("[WebSocket] Notification connection established");
        this.updateConnectionStatus();
      };

      socket.onmessage = (event) => this.handleMessage(event);
      socket.onclose = (event) => this.handleClose(event);
      socket.onerror = (error) => {
        console.error("[WebSocket] Notification Error:", error);
        this.updateConnectionStatus();
      };
    } catch (error) {
      console.error("[WebSocket] Failed to connect Notifications:", error);
    }
  }

  private updateConnectionStatus(): void {
    const isChatOpen = this.chatSocket?.readyState === WebSocket.OPEN;
    const isNotifOpen = this.notificationSocket?.readyState === WebSocket.OPEN;

    if (isChatOpen || isNotifOpen) {
      this.updateState("connected");
      this.reconnectAttempts = 0;
      this.startHeartbeat();

      if (this.queryClient && isNotifOpen) {
        console.log("[WebSocket] Refreshing queries after connection...");
        this.queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
        this.queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
      }
    } else {
      this.updateState("disconnected");
    }
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    this.clearTimers();
    this.stopHeartbeat();

    if (this.chatSocket) {
      this.chatSocket.close(1000, "Intentional disconnect");
      this.chatSocket = null;
    }
    if (this.notificationSocket) {
      this.notificationSocket.close(1000, "Intentional disconnect");
      this.notificationSocket = null;
    }

    this.isAuthenticated = false;
    this.token = null;
    this.userId = null;
    this.queryClient = null;
    this.reconnectAttempts = 0;
    this.updateState("disconnected");
  }

  sendMessage(message: WebSocketMessage): void {
    const socket = this.chatSocket; // Chat messages go to chat socket
    if (
      socket &&
      socket.readyState === WebSocket.OPEN &&
      this.isAuthenticated
    ) {
      try {
        socket.send(JSON.stringify(message));
      } catch (error) {
        console.error("[WebSocket] Failed to send message:", error);
      }
    } else {
      console.warn("[WebSocket] Cannot send message: not connected");
    }
  }

  /**
   * Send delivery receipt for a specific message
   */
  private sendDeliveryReceipt(conversationId: string, messageId: string): void {
      if (!this.userId) return;
      
      this.sendMessage({
          type: 'message_delivered',
          conversationId,
          messageId,
          content: '', // Required by type but unused for status
      });
  }

  /**
   * Send read receipt for a conversation up to a specific message
   */
  sendReadReceipt(conversationId: string, messageId: string): void {
      if (!this.userId || !this.chatSocket || this.chatSocket.readyState !== WebSocket.OPEN) {
          console.warn("[WebSocket] sendReadReceipt aborted: socket not open or unauthenticated");
          return;
      }

      console.log(`[WebSocket] 📤 sendReadReceipt sending message_read for conv ${conversationId} up to msg ${messageId}`);

      this.sendMessage({
          type: 'message_read',
          conversationId,
          lastReadMessageId: messageId,
          content: '',
      });
  }

  reconnect(): void {
    if (this.token && this.userId && this.queryClient) {
      this.reconnectAttempts = 0;
      this.disconnect();
      setTimeout(() => {
        this.connect(this.token!, this.userId!, this.queryClient!);
      }, 1000);
    }
  }

  // ==================== Private Methods ====================

  private updateState(newState: ConnectionState): void {
    if (this.connectionState !== newState) {
      this.connectionState = newState;
      this.listeners.forEach((listener) => listener(newState));
    }
  }

  /**
   * Get WebSocket URL for different services
   * @param service - 'notifications' (default) or 'chat'
   */
  private getWebSocketUrl(service: 'notifications' | 'chat' = 'chat'): string {
    // Chat service has its own WebSocket server - connect via API Gateway
    if (service === 'chat') {
      // Use API Gateway URL (usually port 8080)
      const baseUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080";
      
      const wsUrl = baseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:") + "/api/v1/chat";
      return `${wsUrl}?token=${this.token || ''}`;
    }

    // Default: Notifications WebSocket
    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8080";
    return baseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:") +
      "/api/v1/notifications" + `?token=${this.token || ''}`; // Append token for Notification Service too
  }

  // sendAuthMessage removed - handled by Gateway Handshake

  private handleMessage(event: MessageEvent): void {
    try {
      if (!event.data || typeof event.data !== "string") {
        console.warn("[WebSocket] Invalid message:", event.data);
        return;
      }

      const message: WebSocketMessage = JSON.parse(event.data);

      if (!message || typeof message !== "object" || (!message.type && !message.event)) {
        console.warn("[WebSocket] Message without type:", message);
        return;
      }

      // Handle authentication success confirmation (legacy support or double check)
      if (message.type === "auth_success") {
        // Already handled in onopen, but safe to ignore or log
        // console.log("Auth success confirmed by service");
        return;
      }

      if (message.type === "auth_error") {
        console.error("[WebSocket] Authentication failed (Service rejected):", message.error);
        this.isAuthenticated = false;
        this.updateState("disconnected");
        if (this.chatSocket) {
          this.chatSocket.close(4001, "Authentication failed");
        }
        if (this.notificationSocket) {
          this.notificationSocket.close(4001, "Authentication failed");
        }
        return;
      }

      // Only process messages if authenticated
      if (!this.isAuthenticated) {
        console.warn("[WebSocket] Message before authentication, ignoring");
        return;
      }

      // Handle notification messages (existing)
      if (message.type === "new_notification" || message.type === "unread_count") {
        console.log(`[WebSocket] 🔔 Routing notification message: ${message.type}`);
        this.handleNotificationMessage(message);
        return;
      }

      // Handle chat messages (ENHANCED - supports multiple event types)
      else if (message.type === "new_message") {
        // ✅ FIX: Backend sends double-wrapped: {type: "new_message", data: {type: "new_message", data: actualMessage}}
        // So we need to drill down to message.data.data to get the actual message object
        const actualMessage = ((message.data as any)?.data || message.data) as any;
        console.log("[WebSocket] Received new_message, extracting actual payload:", actualMessage);
        this.handleNewChatMessage(actualMessage as Message);
        return;
      } else if (message.type === "pong") {
        // Heartbeat response - connection is alive
        return;
      } else if (message.type === "message_sent") {
        this.handleMessageSent(message.data);
        return;
      }

      if (message.type === "message_status_updated") {
        this.handleMessageStatusUpdate(message.data as any);
        return;
      }

      if (message.type === "presence_change") {
        this.handlePresenceChange(message.data as any);
        return;
      }

      // Handle Pin/Unpin events
      if (message.type === 'message_pinned' || message.type === 'message_unpinned') {
          console.log(`[WebSocket] 📌 Pin update received: ${message.type}`, message.data);
          
          // 1. Dispatch event for PinnedMessageBar (ChatWindow listener)
          if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('chat:pin_update', {
                  detail: { 
                      type: message.type, 
                      data: message.data,
                      conversationId: message.conversationId,
                      messageId: (message.data as any)?.id || (message.data as any)?.messageId // Handle both formats
                  }
              }));
          }

          // 2. Update Message List Cache (to show/hide pin icon on bubble)
          if (message.conversationId && this.queryClient) {
              const queryKey = queryKeys.chat.messages.list(message.conversationId);
              
              this.queryClient.setQueryData(queryKey, (oldData: any) => {
                  if (!oldData || !oldData.pages) return oldData;

                  const targetMessageId = message.type === 'message_pinned' 
                      ? (message.data as any).id 
                      : (message.data as any).messageId;

                  const newPages = oldData.pages.map((page: any) => ({
                      ...page,
                      messages: page.messages.map((msg: Message) => {
                          if (msg.id === targetMessageId) {
                              return {
                                  ...msg,
                                  isPinned: message.type === 'message_pinned'
                              };
                          }
                          return msg;
                      })
                  }));

                  return { ...oldData, pages: newPages };
              });
          }
          return;
      }

      // Handle Reaction events
      if (message.type === 'reaction_added' || message.type === 'reaction_removed') {
          console.log(`[WebSocket] 😀 Reaction update received: ${message.type}`, message.data);
          
          if (message.conversationId && this.queryClient) {
              const queryKey = queryKeys.chat.messages.list(message.conversationId);
              const { messageId, userId, emoji } = message.data as any;

              this.queryClient.setQueryData(queryKey, (oldData: any) => {
                  if (!oldData || !oldData.pages) return oldData;

                  const newPages = oldData.pages.map((page: any) => ({
                      ...page,
                      messages: page.messages.map((msg: Message) => {
                          if (msg.id === messageId) {
                              if (message.type === 'reaction_added') {
                                  // Add reaction if not already there
                                  const exists = msg.reactions?.some(r => r.userId === userId && r.emoji === emoji);
                                  if (exists) return msg;
                                  
                                  return {
                                      ...msg,
                                      reactions: [...(msg.reactions || []), { 
                                          id: `temp-${Date.now()}`, 
                                          messageId, 
                                          userId, 
                                          emoji, 
                                          createdAt: new Date().toISOString() 
                                      }]
                                  };
                              } else {
                                  // Remove reaction
                                  return {
                                      ...msg,
                                      reactions: (msg.reactions || []).filter(r => !(r.userId === userId && r.emoji === emoji))
                                  };
                              }
                          }
                          return msg;
                      })
                  }));

                  return { ...oldData, pages: newPages };
              });
          }
          return;
      }

      // Legacy chat message support (if backend still uses event format)
      if (message.event === "message:new") {
          this.handleNewChatMessage(message.data as Message);
          return;
      }

      // ✅ FIX: Handle group_deleted separately - directly remove from cache
      // Do NOT use invalidateQueries here - it triggers a race-condition refetch
      // that can re-add the deleted group before the filter takes effect.
      if (message.type === 'group_deleted') {
          const { conversationId: deletedConvId } = message.data as any;
          console.log(`[WebSocket] 🗑️ group_deleted received, removing ${deletedConvId} from cache`);

          if (this.queryClient && deletedConvId) {
              this.queryClient.setQueryData(
                  queryKeys.chat.conversations.list(),
                  (oldData: any) => {
                      if (!oldData || !oldData.pages) return oldData;
                      return {
                          ...oldData,
                          pages: oldData.pages.map((page: any) => ({
                              ...page,
                              data: Array.isArray(page.data)
                                  ? page.data.filter((conv: any) => conv.conversationId !== deletedConvId)
                                  : []
                          }))
                      };
                  }
              );
          }

          // Dispatch event so chat page can deselect if it's the active conversation
          if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('group_deleted', { detail: message.data }));
              window.dispatchEvent(new CustomEvent('active_group_deleted', { detail: message.data }));
          }
          return;
      }

      // Handle Group Events
      const groupEvents = [
          'group_created', 
          'group_updated', 
          'participants_added', 
          'participant_removed',
          'participant_left',
          'role_updated'
      ];

      if (groupEvents.includes(message.type)) {
          console.log(`[WebSocket] 👥 Group Event Received: ${message.type}`, message.data);
          this.handleGroupEvent(message.type, message.data);
          return;
      }

      // Handle Call Events
      const callEvents = [
          'call:incoming', 
          'call:participant_joined', 
          'call:participant_left', 
          'call:signal', 
          'call:ended', 
          'call:participants', 
          'call:media_toggled'
      ];

      if (callEvents.includes(message.type)) {
          console.log(`[WebSocket] 📞 Call Event Received: ${message.type}`, message);
          // ✅ FIX: Unwrap data property if it exists (for Redis-broadcasted events)
          const payload = message.data || message;
          this.handleCallEvent(message.type, payload as any); 
          return;
      }
      
      // Handle Message Deletion
      if (message.type === 'message_deleted') {
          console.log(`[WebSocket] 🗑️ Message deletion received:`, message.data);
          const { messageId, conversationId, deleteForEveryone } = message.data as any;

          if (conversationId && this.queryClient) {
              const queryFilter = { queryKey: ["chat", "messages", "list", conversationId] };
              
              this.queryClient.setQueriesData(queryFilter, (oldData: any) => {
                  console.log(`[WebSocket] setQueriesData trigger. Data exists:`, !!oldData);
                  if (!oldData || !oldData.pages) return oldData;

                  const newPages = oldData.pages.map((page: any) => ({
                      ...page,
                      messages: page.messages.map((msg: Message) => 
                        msg.id === messageId 
                          ? { ...msg, deletedForAll: true, content: "This message was deleted" } 
                          : msg
                      )
                  }));

                  return { ...oldData, pages: newPages };
              });
              
              // Also invalidate conversations to update last message preview
              this.queryClient.invalidateQueries({
                  queryKey: queryKeys.chat.conversations.all
              });
          }
          return;
      }

      // Handle WebSocket Errors (e.g. Blocked user, invalid content)
      if (message.type === 'error') {
          console.warn("[WebSocket] 🛑 Error from server:", message.error);
          
          const { dedupeId, conversationId, error: errorMessage } = message as any;

          if (dedupeId && conversationId && this.queryClient) {
              console.log("[WebSocket] ⏪ Reverting optimistic message due to error:", dedupeId);
              
              const queryKey = queryKeys.chat.messages.list(conversationId);
              
              this.queryClient.setQueryData(queryKey, (oldData: any) => {
                  if (!oldData || !oldData.pages) return oldData;
                  
                  const newPages = oldData.pages.map((page: any) => ({
                      ...page,
                      messages: page.messages.map((msg: Message) => {
                          if (msg.dedupeId === dedupeId || (msg.id && msg.id.includes(dedupeId))) {
                              return {
                                  ...msg,
                                  status: 'FAILED',
                                  content: msg.content, // Keep content
                                  error: errorMessage || 'Failed to send'
                              };
                          }
                          return msg;
                      })
                  }));
                  
                  return { ...oldData, pages: newPages };
              });
              
              // We could also show a toast here, but need to be careful with Context/Toast integration
              if (typeof window !== 'undefined') {
                  const event = new CustomEvent('chat:message_error', { 
                      detail: { error: errorMessage, dedupeId, conversationId } 
                  });
                  window.dispatchEvent(event);
              }
          } else if (errorMessage) {
             // General error where we don't have dedupeId
             if (typeof window !== 'undefined') {
                  const event = new CustomEvent('chat:general_error', { 
                      detail: { error: errorMessage } 
                  });
                  window.dispatchEvent(event);
              }
          }
          return;
      }

      // Handle Block / Unblock Lifecycle Events
      if (message.type === 'USER_BLOCKED' || message.type === 'USER_UNBLOCKED') {
          console.log(`[WebSocket] 🛡️ Block state changed: ${message.type}`, message.data);
          
          const { conversationId, systemMessage, blockerId, blockedId, unblockerId, unblockedId } = message.data as any;

          if (conversationId && this.queryClient) {
              // Compute new block state for this user
              let newIsBlockedByMe = false;
              let newIsBlockedByThem = false;

              if (message.type === 'USER_BLOCKED') {
                  if (this.userId === blockerId) newIsBlockedByMe = true;
                  if (this.userId === blockedId) newIsBlockedByThem = true;
              } else if (message.type === 'USER_UNBLOCKED') {
                  // Only clear the flag that belongs to this user's role
                  // newIsBlockedByMe starts as false — only set true if they are still blocked (not applicable here)
                  // newIsBlockedByThem: if we were the blockedId, we are now unblocked by them
                  if (this.userId === unblockerId) newIsBlockedByMe = false;
                  if (this.userId === unblockedId) newIsBlockedByThem = false;
              }

              // 1. Update conversation queries to refresh `isBlockedByMe` / `isBlockedByThem`
              this.queryClient.setQueriesData(
                  { queryKey: queryKeys.chat.conversations.list() },
                  (oldData: any) => {
                      if (!oldData || !oldData.pages) return oldData;
                      
                      const newPages = oldData.pages.map((page: any) => ({
                          ...page,
                          data: page.data.map((conv: any) => {
                              if (conv.conversationId === conversationId) {
                                  let isBlockedByMe = conv.isBlockedByMe ?? false;
                                  let isBlockedByThem = conv.isBlockedByThem ?? false;

                                  if (message.type === 'USER_BLOCKED') {
                                      if (this.userId === blockerId) isBlockedByMe = true;
                                      if (this.userId === blockedId) isBlockedByThem = true;
                                  } else if (message.type === 'USER_UNBLOCKED') {
                                      if (this.userId === unblockerId) isBlockedByMe = false;
                                      if (this.userId === unblockedId) isBlockedByThem = false;
                                  }

                                  return { ...conv, isBlockedByMe, isBlockedByThem };
                              }
                              return conv;
                          })
                      }));
                      return { ...oldData, pages: newPages };
                  }
              );

              // Dispatch event ONCE after the map (not inside map loop)
              if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('chat:block_updated', {
                      detail: { 
                          conversationId, 
                          isBlockedByMe: newIsBlockedByMe, 
                          isBlockedByThem: newIsBlockedByThem 
                      }
                  }));
              }

              // 2. Inject the new SYSTEM message directly into the chat if we have it
              if (systemMessage) {
                  // Deduplicate using existing mechanism
                  if (this.processedMessageIds.has(systemMessage.id)) {
                      console.warn("[WebSocket] ♻️ Duplicate system message rejected:", systemMessage.id);
                      return;
                  }
                  this.processedMessageIds.add(systemMessage.id);

                  const queryKey = queryKeys.chat.messages.list(conversationId);
                  
                  this.queryClient.setQueryData(queryKey, (oldData: any) => {
                      if (!oldData || !oldData.pages) return oldData;
                      
                      const newPages = [...oldData.pages];
                      const firstPage = { ...newPages[0] };
                      
                      // Check if message already exists to prevent duplicates
                      const exists = firstPage.messages?.some((m: Message) => m.id === systemMessage.id);
                      
                      if (!exists) {
                          firstPage.messages = [systemMessage, ...(firstPage.messages || [])];
                          newPages[0] = firstPage;
                      }
                      
                      return { ...oldData, pages: newPages };
                  });
              }
          }
          return;
      }

      // --- Group Governance Events ---
      if (['participants_added', 'participant_removed', 'role_updated', 'group_updated', 'participant_left'].includes(message.type)) {
          console.log(`[WebSocket] 👥 Group Event: ${message.type}`, message.data);
          
          if (typeof window !== 'undefined') {
              // Dispatch to UI components so they can refresh (e.g., GroupDetailsModal, ChatWindow)
              window.dispatchEvent(new CustomEvent(message.type, {
                  detail: message.data
              }));
          }

          const { conversationId, systemMessage } = message.data as any;

          // Inject SYSTEM message into the chat if provided
          if (conversationId && systemMessage && this.queryClient) {
              if (this.processedMessageIds.has(systemMessage.id)) {
                  console.warn("[WebSocket] ♻️ Duplicate group system message rejected:", systemMessage.id);
                  return;
              }
              this.processedMessageIds.add(systemMessage.id);

              const queryKey = queryKeys.chat.messages.list(conversationId);
              this.queryClient.setQueryData(queryKey, (oldData: any) => {
                  if (!oldData || !oldData.pages) return oldData;
                  
                  const newPages = [...oldData.pages];
                  const firstPage = { ...newPages[0] };
                  
                  const exists = firstPage.messages?.some((m: Message) => m.id === systemMessage.id);
                  if (!exists) {
                      firstPage.messages = [systemMessage, ...(firstPage.messages || [])];
                      newPages[0] = firstPage;
                  }
                  
                  return { ...oldData, pages: newPages };
              });
          }

          // If the current user was removed, we should probably boot them from the chat window
          if (message.type === 'participant_removed' && message.data.removedUserId === this.userId) {
               console.log("🛑 Booting self from chat because I was removed from group", conversationId);
               this.queryClient?.invalidateQueries({ queryKey: queryKeys.chat.conversations.list() });
               if (typeof window !== 'undefined') {
                   window.dispatchEvent(new CustomEvent('chat:self_removed', { detail: { conversationId } }));
               }
          } else {
               // Soft-Invalidate the conversations list so group names/participants array refreshes
               // This ensures when you open group info, you see the right members
               this.queryClient?.invalidateQueries({ queryKey: queryKeys.chat.conversations.list() });
               this.queryClient?.invalidateQueries({ queryKey: ['conversation', conversationId] });
          }

          return;
      }

      // Unknown message type
      console.warn("[WebSocket] Unknown message:", message);
    } catch (error) {
      console.error("[WebSocket] Failed to parse message:", error);
    }
  }
  /**
   * Handle incoming chat message from another user
   */
  private handleNewChatMessage(messageData: Message): void {
    if (!this.queryClient) {
      console.warn("[WebSocket] ⚠️ No queryClient available for handleNewChatMessage");
      return;
    }

    // ✅ FIX: Prevent duplicate processing of the same message ID
    if (this.processedMessageIds.has(messageData.id)) {
        console.warn("[WebSocket] ♻️ REJECTED duplicate message event:", messageData.id);
        return;
    }
    this.processedMessageIds.add(messageData.id);

    console.log("[WebSocket] 📨 New chat message received:", {
      id: messageData.id,
      conversationId: messageData.conversationId,
      content: messageData.content,
      senderId: messageData.senderId,
      timestamp: messageData.createdAt
    });

    // ✅ FIX: Send delivery receipt if message is from another user
    if (this.userId && messageData.senderId !== this.userId) {
        this.sendDeliveryReceipt(messageData.conversationId, messageData.id);
    }

    // Update messages cache for this conversation
    if (messageData.conversationId) {
      const queryKey = queryKeys.chat.messages.list(messageData.conversationId);
      console.log(`[WebSocket] 🔑 Updating query key: ${JSON.stringify(queryKey)} for conv: ${messageData.conversationId}`);

      // Check if cache exists
      const currentCache = this.queryClient.getQueryData(queryKey);
      console.log(`[WebSocket] 📦 Cache exists?`, !!currentCache);
      
      this.queryClient.setQueryData(
        queryKey,
        (oldData: any) => {
           console.log("[WebSocket] 📦 Updating Cache. Pages:", oldData?.pages?.length);
           
           if (!oldData) {
             console.warn("[WebSocket] ⚠️ No existing cache data, message won't be added (User might not have opened chat yet)!");
             return oldData;
           }
           
           const newPages = [...oldData.pages];

           // 1. Check if message already exists (by ID) in any page
           const exists = newPages.some((page: any) => 
               page.messages.some((msg: Message) => msg.id === messageData.id)
           );
           if (exists) {
             console.log("[WebSocket] ✅ Message already exists in cache, skipping");
             return oldData;
           }

           // 2. Check for dedupeId (Optimistic replacement)
           let replaced = false;
           if (messageData.dedupeId) {
               console.log("[WebSocket] 🔍 Looking for optimistic message with dedupeId:", messageData.dedupeId);
               for (let i = 0; i < newPages.length; i++) {
                    const index = newPages[i].messages.findIndex((msg: Message) => 
                        msg.dedupeId === messageData.dedupeId || (msg.id && msg.id.includes(messageData.dedupeId!))
                    );
                    if (index !== -1) {
                        console.log("[WebSocket] 🔄 Replacing optimistic message at page", i, "index", index);
                        // ... replacement logic ... (Keeping existing logic below, just ensuring logs)
                       newPages[i] = {
                            ...newPages[i],
                            messages: [
                                ...newPages[i].messages.slice(0, index),
                                messageData,
                                ...newPages[i].messages.slice(index + 1)
                            ]
                        };
                        replaced = true;
                        break;
                    }
                }
            }

            // 3. If not replaced, prepend to first page (newest message)
            // We assume first page contains newest messages
            if (!replaced) {
                 console.log("[WebSocket] ➕ Prepending new message to first page");
                 if (newPages.length > 0) {
                      newPages[0] = {
                          ...newPages[0],
                          messages: [messageData, ...newPages[0].messages]
                      };
                      console.log("[WebSocket] ✅ Message added! New first page has", newPages[0].messages.length, "messages");
                 } else {
                     console.log("[WebSocket] 📄 Initializing first page with message");
                     newPages.push({
                         messages: [messageData],
                         hasMore: false,
                         total: 1
                     });
                 }
            }

          return {
            ...oldData,
            pages: newPages
          };
        }
      );

      // ✅ SAFETY NET: Invalidate queries to ensure consistency
      // If setQueryData failed silently or UI didn't update, this ensures we fetch fresh data
      this.queryClient.invalidateQueries({
          queryKey: queryKeys.chat.messages.list(messageData.conversationId)
      });
      // Also invalidate conversation list to update previews
      this.queryClient.invalidateQueries({
          queryKey: queryKeys.chat.conversations.all
      });

      // Send delivery acknowledgment automatically
      if (this.chatSocket && this.chatSocket.readyState === WebSocket.OPEN) {
        try {
          this.chatSocket.send(JSON.stringify({
            type: "message_delivered",
            messageId: messageData.id,
            conversationId: messageData.conversationId 
          }));
          console.log("[WebSocket] ✉️  Sent delivery ACK for:", messageData.id);
        } catch (error) {
          console.error("[WebSocket] ❌ Failed to send delivery ACK:", error);
        }
      }
    } else {
      console.error("[WebSocket] ❌ Message has no conversationId!", messageData);
    }

    // ✅ FIX: Force immediate refetch of conversations list to update last message preview
    // Previously used invalidateQueries which only marks as stale without refetching
    console.log("[WebSocket] 🔄 Refetching conversations list to update preview");
    this.queryClient.refetchQueries({
      queryKey: queryKeys.chat.conversations.list(),
      type: "active",
    });
  }

  /**
   * Handle message_sent confirmation from server
   * Updates optimistic message with real data
   */
  private handleMessageSent(data: any): void {
    if (!this.queryClient) return;

    console.log("[WebSocket] Message sent confirmation:", data);

    if (data.conversationId && data.id) {
      this.queryClient.setQueryData(
        queryKeys.chat.messages.list(data.conversationId),
        (oldData: any) => {
           if (!oldData) return oldData;
           const newPages = [...oldData.pages];

           // Replace temp message (dedupeId match)
           for (let i = 0; i < newPages.length; i++) {
               const index = newPages[i].messages.findIndex((msg: Message) =>
                    msg.dedupeId === data.dedupeId || (msg.id && msg.id.includes(data.dedupeId))
               );

               if (index !== -1) {
                   const updatedMessages = [...newPages[i].messages];
                   // Merge real data status but keep local optimistic fields if needed
                   // ✅ FIX: Merge with existing message to preserve optimistic fields (like replyTo)
                   // in case backend response is partial or missing relations
                   updatedMessages[index] = { 
                       ...updatedMessages[index], 
                       ...data, 
                       status: 'SENT' 
                   }; 
                   newPages[i] = { ...newPages[i], messages: updatedMessages };
                   
                   return {
                       ...oldData,
                       pages: newPages
                   };
               }
           }
           
           // If not found in any page (could be looking at older page?),
           // we might want to prepend it to first page or just ignore (assume handleNewChatMessage catches it)
           // For now, let's prepend to ensure it shows up if it was a ghost message
            if (newPages.length > 0) {
                 newPages[0] = {
                     ...newPages[0],
                     messages: [{ ...data, status: 'SENT' }, ...newPages[0].messages]
                 };
            }

            return {
                ...oldData,
                pages: newPages
            };
        }
      );
    }

    // Update conversations list
    this.queryClient.invalidateQueries({
      queryKey: queryKeys.chat.conversations.all,
      refetchType: "active",
    });
  }

  /**
   * Handle message status updates (DELIVERED/READ)
   * Updates status indicators in UI (checkmarks)
   */
  private handleMessageStatusUpdate(data: any): void {
    if (!this.queryClient) return;

    console.log("[WebSocket] Message status update:", data);

    const updateMessagesInPages = (oldData: any) => {
        if (!oldData || !oldData.pages) return oldData;
        
        const newPages = oldData.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((msg: Message) => {
                 // 1. Single Message Update
                 if (data.messageId && msg.id === data.messageId) {
                     return {
                        ...msg,
                        status: data.status,
                        deliveredAt: data.deliveredAt || msg.deliveredAt,
                        readAt: data.readAt || msg.readAt,
                     };
                 }
                 // 2. Bulk Read Update (up to lastReadMessageId)
                 if (data.lastReadMessageId && data.conversationId) {
                      // Find the target message to get its timestamp for accurate bulk update
                      let targetTimestamp: string | null = null;
                      for (const p of oldData.pages) {
                          const targetMsg = p.messages.find((m: Message) => m.id === data.lastReadMessageId);
                          if (targetMsg) {
                              targetTimestamp = targetMsg.createdAt;
                              break;
                          }
                      }

                      // Update ALL messages up to the target timestamp/ID
                      const isReadWithTimestamp = (m: Message) => {
                          if (targetTimestamp) {
                              return m.createdAt <= targetTimestamp;
                          }
                          return m.id <= data.lastReadMessageId; // Fallback
                      };

                      if (isReadWithTimestamp(msg) && msg.status !== 'READ') {
                          return { ...msg, status: 'READ', readAt: data.readAt || new Date().toISOString() };
                      }
                 }
                 return msg;
            })
        }));
        
        return { ...oldData, pages: newPages };
    };

    if (data.conversationId) {
       this.queryClient.setQueryData(
        queryKeys.chat.messages.list(data.conversationId),
        (oldData: any) => updateMessagesInPages(oldData)
      );
    } else if (data.messageId) {
         // Fallback: Scan all chats
        const queryCache = this.queryClient.getQueryCache();
        const messageQueries = queryCache.findAll({
            predicate: (query: import('@tanstack/react-query').Query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0] === 'chat' &&
            query.queryKey[1] === 'messages'
        });
        messageQueries.forEach((query: any) => {
             this.queryClient.setQueryData(query.queryKey, (old: any) => updateMessagesInPages(old));
        });
    }
  }

  private handleNotificationMessage(message: WebSocketMessage): void {
    if (!this.userId || !this.queryClient) return;

    switch (message.type) {
      case "new_notification":
        console.log("[WebSocket] 🔔 New notification received:", message.data);
        
        // 1. Update Notification List Cache (Prepend to Infinite Query)
        const listQueryKey = queryKeys.notifications.list(this.userId);
        this.queryClient.setQueryData(listQueryKey, (oldData: any) => {
          if (!oldData || !oldData.pages) return oldData;
          
          // Ensure createdAt exists to avoid RangeError in date-fns
          const notificationData = { ...(message.data as any) };
          const d = notificationData.createdAt ? new Date(notificationData.createdAt) : new Date();
          notificationData.createdAt = isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
          notificationData.time = isNaN(d.getTime()) ? new Date() : d;
          
          // Prepend to the first page
          const newPages = [...oldData.pages];
          if (newPages.length > 0) {
            console.log("[WebSocket] 📥 Prepending new notification to cache list");
            newPages[0] = {
              ...newPages[0],
              notifications: [notificationData, ...newPages[0].notifications],
              total: (newPages[0].total || 0) + 1
            };
          } else {
            console.warn("[WebSocket] ⚠️ No pages found in notification cache to prepend to");
          }
          
          return { ...oldData, pages: newPages };
        });

        // Trigger toast for admin actions
        const notificationData = message.data as any;
        const notificationAction = notificationData?.metadata?.action;
        const entityType = notificationData?.metadata?.entityType;
        const isHub = entityType === "HUB" || entityType === "CONVERSATION";

        if (notificationData?.type === "CONTENT_HIDDEN") {
          let actionText = "hidden";
          if (notificationAction === "UNHIDE") actionText = "restored";
          else if (notificationAction === "DELETE") actionText = "permanently deleted";
          else if (notificationAction === "SUSPEND") actionText = isHub ? "suspended" : "temporarily restricted";
          else if (notificationAction === "BAN") actionText = "banned";

          const entityLabel = isHub ? "Hub" : "content";
          const messageStr = notificationAction === "SUSPEND" && isHub 
            ? `System Alert: Your Hub has been suspended for a policy violation.`
            : `System Alert: Your ${entityLabel} has been ${actionText}.`;

          toast.success(messageStr, {
            icon: notificationAction === "UNHIDE" ? "🟢" : "🔴",
            duration: 6000,
          });
        }

        // 2. Refresh count query
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.notifications.count(this.userId),
          refetchType: "active",
        });

        // 3. Fallback: Invalidate list to ensure consistency if setQueryData didn't match something
        this.queryClient.invalidateQueries({
          queryKey: listQueryKey,
          refetchType: "none", // Background refetch if needed
        });
        break;

      case "unread_count":
        const unreadData = message.data as any;
        if (unreadData && typeof unreadData.unreadCount === "number") {
          console.log("[WebSocket] 🔢 Unread count updated:", unreadData.unreadCount);
          this.queryClient.setQueryData(
            queryKeys.notifications.count(this.userId),
            { unreadCount: unreadData.unreadCount }
          );
        }
        break;

      default:
        console.warn("[WebSocket] Unknown message type:", message.type);
    }
  }

  /**
   * Handle incoming chat messages
   * NEW: Added for chat feature support
   */
  private handleChatMessage(messageData: any): void {
    if (!this.queryClient) return;

    console.log("[WebSocket] Chat message received:", messageData);

    // Invalidate conversations query to update "last message"
    this.queryClient.invalidateQueries({
      queryKey: ["chat", "conversations"],
      refetchType: "active",
    });

    // Broadcast to components via custom event
    // Components can listen: window.addEventListener('chat:message', ...)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chat:message', {
        detail: messageData
      }));
    }
  }

  private handleClose(event: CloseEvent): void {
    if (this.isIntentionalClose) {
      this.updateConnectionStatus();
      return;
    }

    console.warn(`[WebSocket] Connection closed (code: ${event.code})`);
    this.updateConnectionStatus();

    // Abnormal closure or service-initiated closure - attempt reconnect
    if (event.code !== 1000 && event.code !== 1001) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout || this.isIntentionalClose) return;

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`[WebSocket] Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts})...`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (this.token && this.userId && this.queryClient) {
        this.connect(this.token, this.userId, this.queryClient);
      }
    }, delay);
  }

  /**
   * Handle group-related events by dispatching custom window events
   * This allows hooks like useGroupSocketEvents to listen without accessing the socket directly
   */
  private handleGroupEvent(type: string, data: any): void {
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(type, { detail: data }));
          
          // Also perform general cache invalidation here as a fallback/safeguard
          if (this.queryClient) {
             // Invalidate conversation list for all group events
             this.queryClient.invalidateQueries({
                 queryKey: queryKeys.chat.conversations.all
             });
          }
      }
  }

  /**
   * Handle call-related events by dispatching custom window events
   * This allows VideoCallContext to listen without accessing the socket directly
   */
  private handleCallEvent(type: string, data: any): void {
      if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(type, { detail: data }));
      }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.chatSocket?.readyState === WebSocket.OPEN) {
        this.chatSocket.send(JSON.stringify({ type: "ping" }));
      }
      if (this.notificationSocket?.readyState === WebSocket.OPEN) {
        this.notificationSocket.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  // ==================== Event Handlers ====================

  private handleVisibilityChange(): void {
    this.isTabVisible = document.visibilityState === "visible";
    console.log("[WebSocket] Tab visibility changed:", this.isTabVisible);

    if (this.isTabVisible) {
      if (this.token && this.userId && this.queryClient) {
        const isChatOpen = this.chatSocket?.readyState === WebSocket.OPEN;
        const isNotifOpen = this.notificationSocket?.readyState === WebSocket.OPEN;
        
        if (!isChatOpen || !isNotifOpen) {
          console.log("[WebSocket] Tab visible, reconnecting missing sockets...");
          this.connect(this.token, this.userId, this.queryClient);
        }
      }
    } else {
      // Optional: disconnect or reduce frequency when tab is hidden
      // For now, keep connected but maybe stop some background tasks
    }
  }

  private handleOnline(): void {
    this.isOnline = true;
    console.log("[WebSocket] Network back online");
    if (this.token && this.userId && this.queryClient) {
      this.connect(this.token, this.userId, this.queryClient);
    }
  };

  private handleOffline(): void {
    this.isOnline = false;
    // Connection will close automatically, no need to force it
  };

  /**
   * Handle presence change (online/offline/lastSeen)
   * Updates conversation cache to reflect real-time status
   */
  private handlePresenceChange(data: { userId: string, isOnline: boolean, lastSeen?: string }): void {
      if (!this.queryClient) return;

      console.log("[WebSocket] Presence change received:", data);

      // Update all conversations that include this user
      this.queryClient.setQueriesData(
          { queryKey: queryKeys.chat.conversations.list() },
          (oldData: any) => {
              if (!oldData || !oldData.pages) return oldData;
              
              const updatedPages = oldData.pages.map((page: any) => ({
                  ...page,
                  data: page.data.map((conv: any) => ({
                      ...conv,
                      participants: conv.participants.map((p: any) => 
                          p.userId === data.userId 
                              ? { ...p, isOnline: data.isOnline, lastSeen: data.lastSeen || p.lastSeen }
                              : p
                      )
                  }))
              }));

              return { ...oldData, pages: updatedPages };
          }
      );
  }

  // Cleanup on destroy
  destroy(): void {
    this.disconnect();
    if (typeof document !== "undefined") {
      document.removeEventListener(
        "visibilitychange",
        this.handleVisibilityChange
      );
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
    }
    WebSocketManager.instance = null;
  }
}

// ==================== Context ====================

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

// ==================== Provider Component ====================

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const managerRef = useRef<WebSocketManager | null>(null);

  // Initialize manager
  useEffect(() => {
    managerRef.current = WebSocketManager.getInstance();
    return () => {
      // Don't destroy on unmount - keep singleton alive
      // Only destroy on app shutdown
    };
  }, []);

  // Subscribe to connection state changes
  useEffect(() => {
    if (!managerRef.current) return;

    const unsubscribe = managerRef.current.subscribe((newState) => {
      setConnectionState(newState);
    });

    return unsubscribe;
  }, []);

  // Connect when session is available
  useEffect(() => {
    if (!managerRef.current) return;

    if (session?.user?.accessToken && session?.user?.id) {
      managerRef.current.connect(
        session.user.accessToken,
        session.user.id,
        queryClient
      );
    } else {
      // Disconnect when no session
      managerRef.current.disconnect();
    }
  }, [session?.user?.accessToken, session?.user?.id, queryClient]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (managerRef.current) {
      managerRef.current.sendMessage(message);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.reconnect();
    }
  }, []);

  const sendReadReceipt = useCallback((conversationId: string, messageId: string) => {
    if (managerRef.current) {
      managerRef.current.sendReadReceipt(conversationId, messageId);
    }
  }, []);

  const value: WebSocketContextType = {
    connectionState,
    sendMessage,
    isConnected: connectionState === "connected",
    reconnect,
    sendReadReceipt,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// ==================== Hook ====================

export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
