"use client";

import React, { createContext, useContext, useEffect, useRef, useCallback, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

// Connection state type
type ConnectionState = "disconnected" | "connecting" | "authenticating" | "connected" | "reconnecting";

interface WebSocketContextType {
  connectionState: ConnectionState;
  sendMessage: (message: any) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// Singleton WebSocket instance
let globalWebSocket: WebSocket | null = null;
let globalConnectionState: ConnectionState = "disconnected";
let globalListeners: Set<(state: ConnectionState) => void> = new Set();
let globalReconnectTimeout: NodeJS.Timeout | null = null;
let globalAuthTimeout: NodeJS.Timeout | null = null;
let globalReconnectAttempts = 0;
let globalIsAuthenticated = false;
let globalIsIntentionalClose = false;

// Configuration constants
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const AUTH_TIMEOUT = 5000;
const HEARTBEAT_INTERVAL = 30000;

// Update all listeners when state changes
function updateConnectionState(newState: ConnectionState) {
  globalConnectionState = newState;
  globalListeners.forEach((listener) => listener(newState));
}

// Get WebSocket URL
function getWebSocketUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_WS_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080";
  return baseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:") + "/api/v1/notifications";
}

// Connect function
function connectWebSocket(
  token: string,
  queryClient: any,
  userId: string
): void {
  // Don't connect if already connected/connecting
  if (
    globalWebSocket?.readyState === WebSocket.OPEN ||
    globalWebSocket?.readyState === WebSocket.CONNECTING
  ) {
    return;
  }

  try {
    updateConnectionState(
      globalReconnectAttempts > 0 ? "reconnecting" : "connecting"
    );
    globalIsAuthenticated = false;

    const wsUrl = getWebSocketUrl();
    const socket = new WebSocket(wsUrl);
    globalWebSocket = socket;

    socket.onopen = () => {
      console.log("[WebSocket] Connection established, authenticating...");
      updateConnectionState("authenticating");

      // Send authentication message
      setTimeout(() => {
        try {
          const authMessage = JSON.stringify({
            type: "auth",
            token: token,
          });
          socket.send(authMessage);

          // Set auth timeout
          globalAuthTimeout = setTimeout(() => {
            if (!globalIsAuthenticated) {
              console.error("[WebSocket] Authentication timeout");
              socket.close(4002, "Authentication timeout");
            }
          }, AUTH_TIMEOUT);
        } catch (error) {
          console.error("[WebSocket] Failed to send auth message:", error);
          socket.close(4000, "Failed to authenticate");
        }
      }, 100);
    };

    socket.onmessage = (event) => {
      try {
        if (!event.data || typeof event.data !== "string") {
          console.warn("[WebSocket] Invalid message:", event.data);
          return;
        }

        const message = JSON.parse(event.data);

        if (!message || typeof message !== "object" || !message.type) {
          console.warn("[WebSocket] Message without type:", message);
          return;
        }

        // Handle authentication
        if (message.type === "auth_success") {
          console.log("[WebSocket] Authentication successful");
          globalIsAuthenticated = true;
          updateConnectionState("connected");
          globalReconnectAttempts = 0;

          if (globalAuthTimeout) {
            clearTimeout(globalAuthTimeout);
            globalAuthTimeout = null;
          }
          return;
        }

        if (message.type === "auth_error") {
          console.error("[WebSocket] Authentication failed:", message.error);
          globalIsAuthenticated = false;
          updateConnectionState("disconnected");

          if (globalAuthTimeout) {
            clearTimeout(globalAuthTimeout);
            globalAuthTimeout = null;
          }
          socket.close(4001, "Authentication failed");
          return;
        }

        // Only process messages if authenticated
        if (!globalIsAuthenticated) {
          console.warn("[WebSocket] Message before authentication, ignoring");
          return;
        }

        // Handle notification messages
        switch (message.type) {
          case "new_notification":
            queryClient.invalidateQueries({
              queryKey: ["notifications", userId],
            });
            queryClient.invalidateQueries({
              queryKey: ["unread-count", userId],
            });
            break;

          case "unread_count":
            if (
              message.data &&
              typeof message.data.unreadCount === "number"
            ) {
              queryClient.setQueryData(["unread-count", userId], {
                unreadCount: message.data.unreadCount,
              });
            }
            break;

          default:
            console.warn("[WebSocket] Unknown message type:", message.type);
        }
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    };

    socket.onclose = (event) => {
      console.log("[WebSocket] Connection closed", {
        code: event.code,
        reason: event.reason,
      });

      if (globalAuthTimeout) {
        clearTimeout(globalAuthTimeout);
        globalAuthTimeout = null;
      }

      updateConnectionState("disconnected");
      globalWebSocket = null;
      globalIsAuthenticated = false;

      // Reconnect logic
      if (
        !globalIsIntentionalClose &&
        event.code !== 1000 &&
        event.code !== 4001 &&
        event.code !== 4002 &&
        globalReconnectAttempts < MAX_RECONNECT_ATTEMPTS
      ) {
        const delay = Math.min(
          BASE_RECONNECT_DELAY * Math.pow(2, globalReconnectAttempts),
          MAX_RECONNECT_DELAY
        );

        globalReconnectAttempts++;
        console.log(
          `[WebSocket] Reconnecting in ${delay}ms (attempt ${globalReconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`
        );

        globalReconnectTimeout = setTimeout(() => {
          connectWebSocket(token, queryClient, userId);
        }, delay);
      } else if (globalReconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        console.error("[WebSocket] Max reconnection attempts reached");
        updateConnectionState("disconnected");
      }
    };

    socket.onerror = (error) => {
      console.error("[WebSocket] Error:", error);
      updateConnectionState("disconnected");
    };
  } catch (error) {
    console.error("[WebSocket] Failed to create connection:", error);
    updateConnectionState("disconnected");
  }
}

// Disconnect function
function disconnectWebSocket(): void {
  globalIsIntentionalClose = true;

  if (globalReconnectTimeout) {
    clearTimeout(globalReconnectTimeout);
    globalReconnectTimeout = null;
  }

  if (globalAuthTimeout) {
    clearTimeout(globalAuthTimeout);
    globalAuthTimeout = null;
  }

  if (globalWebSocket) {
    globalWebSocket.close(1000, "Intentional disconnect");
    globalWebSocket = null;
  }

  globalIsAuthenticated = false;
  updateConnectionState("disconnected");
}

// Send message function
function sendWebSocketMessage(message: any): void {
  if (
    globalWebSocket &&
    globalWebSocket.readyState === WebSocket.OPEN &&
    globalIsAuthenticated
  ) {
    try {
      globalWebSocket.send(JSON.stringify(message));
    } catch (error) {
      console.error("[WebSocket] Failed to send message:", error);
    }
  } else {
    console.warn("[WebSocket] Cannot send message: not connected");
  }
}

// WebSocket Provider Component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [connectionState, setConnectionState] =
    useState<ConnectionState>(globalConnectionState);

  // Subscribe to connection state changes
  useEffect(() => {
    const listener = (newState: ConnectionState) => {
      setConnectionState(newState);
    };
    globalListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
    };
  }, []);

  // Connect when session is available
  useEffect(() => {
    if (session?.user?.accessToken && session?.user?.id) {
      globalIsIntentionalClose = false;
      connectWebSocket(
        session.user.accessToken,
        queryClient,
        session.user.id
      );
    }

    return () => {
      // Only disconnect if this is the last provider instance
      // In practice, with singleton pattern, this won't disconnect
      // unless the entire app unmounts
    };
  }, [session?.user?.accessToken, session?.user?.id, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't disconnect on component unmount - keep connection alive
      // Only disconnect when user logs out
    };
  }, []);

  // Disconnect on logout
  useEffect(() => {
    if (!session?.user?.accessToken) {
      disconnectWebSocket();
    }
  }, [session?.user?.accessToken]);

  const sendMessage = useCallback((message: any) => {
    sendWebSocketMessage(message);
  }, []);

  const value: WebSocketContextType = {
    connectionState,
    sendMessage,
    isConnected: connectionState === "connected",
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

// Hook to use WebSocket context
export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
