
"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

// Connection state type
type ConnectionState =
  | "disconnected"
  | "connecting"
  | "authenticating"
  | "connected"
  | "reconnecting";

// Configuration constants
const MAX_RECONNECT_ATTEMPTS = 5;
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;
const AUTH_TIMEOUT = 5000; // 5 seconds to authenticate

export function useWebSocketNotifications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const isIntentionalCloseRef = useRef(false);
  const isAuthenticatedRef = useRef(false);

  const connect = useCallback(() => {
    // Don't connect if already connected/connecting
    if (
      ws.current?.readyState === WebSocket.OPEN ||
      ws.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    // Don't connect without token
    if (!session?.user?.accessToken || !session?.user?.id) {
      return;
    }

    try {
      setConnectionState(
        reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting"
      );
      isAuthenticatedRef.current = false; // Reset auth state

      // ⭐ Connect WITHOUT token in URL
      const baseUrl =
        process.env.NEXT_PUBLIC_WS_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:8080";
      const wsBaseUrl = baseUrl
        .replace(/^http:/, "ws:")
        .replace(/^https:/, "wss:");
      const wsUrl = `${wsBaseUrl}/api/v1/notifications`; 

      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established, authenticating...");
        setConnectionState("authenticating");

        // Send token as FIRST message immediately after connection
        // const token = session.user.accessToken;
        try {
          // const authMessage = JSON.stringify({
          //   type: "auth",
          //   token: token,
          // });

          // socket.send(authMessage);

          // Small delay to ensure connection is fully ready
          setTimeout(() => {
            const token = session.user.accessToken;
            try {
              const authMessage = JSON.stringify({
                type: "auth",
                token: token,
              });

              socket.send(authMessage);
              // ... rest of code
            } catch (error) {
              console.error("Failed to send auth message:", error);
              socket.close(4000, "Failed to authenticate");
            }
          }, 100);

          // ⭐ Set timeout - if not authenticated in 5 seconds, close connection
          authTimeoutRef.current = setTimeout(() => {
            if (!isAuthenticatedRef.current) {
              console.error("Authentication timeout");
              socket.close(4002, "Authentication timeout");
            }
          }, AUTH_TIMEOUT);
        } catch (error) {
          console.error("Failed to send auth message:", error);
          socket.close(4000, "Failed to authenticate");
        }
      };

      socket.onmessage = (event) => {
        try {
          if (!event.data || typeof event.data !== "string") {
            console.warn("Received invalid WebSocket message:", event.data);
            return;
          }

          const message = JSON.parse(event.data);

          if (!message || typeof message !== "object" || !message.type) {
            console.warn("Received WebSocket message without type:", message);
            return;
          }

          // ⭐ Handle authentication response first
          if (message.type === "auth_success") {
            console.log("WebSocket authentication successful");
            isAuthenticatedRef.current = true;
            setConnectionState("connected");
            reconnectAttemptsRef.current = 0; // Reset on successful auth

            // Clear auth timeout
            if (authTimeoutRef.current) {
              clearTimeout(authTimeoutRef.current);
              authTimeoutRef.current = null;
            }
            return;
          }

          if (message.type === "auth_error") {
            console.error("WebSocket authentication failed:", message.error);
            isAuthenticatedRef.current = false;
            setConnectionState("disconnected");

            // Clear auth timeout
            if (authTimeoutRef.current) {
              clearTimeout(authTimeoutRef.current);
              authTimeoutRef.current = null;
            }

            socket.close(4001, "Authentication failed");
            return;
          }

          //  Only process messages if authenticated
          if (!isAuthenticatedRef.current) {
            console.warn("Received message before authentication, ignoring");
            return;
          }

          // Handle other message types
          switch (message.type) {
            case "new_notification":
              queryClient.invalidateQueries({
                queryKey: ["notifications", session.user.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["unread-count", session.user.id],
              });
              break;

            case "unread_count":
              if (
                message.data &&
                typeof message.data.unreadCount === "number"
              ) {
                queryClient.setQueryData(["unread-count", session.user.id], {
                  unreadCount: message.data.unreadCount,
                });
              } else {
                console.warn("Invalid unread_count message format:", message);
              }
              break;

            default:
              console.warn("Unknown WebSocket message type:", message.type);
              break;
          }
        } catch (error) {
          console.error(
            "Failed to parse WebSocket message:",
            error,
            event.data
          );
        }
      };

      socket.onclose = (event) => {
        console.log("WebSocket connection closed", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });

        // Clear auth timeout
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current);
          authTimeoutRef.current = null;
        }

        setConnectionState("disconnected");
        ws.current = null;
        isAuthenticatedRef.current = false;

        // Only reconnect if:
        // 1. It wasn't an intentional close
        // 2. It wasn't an auth error (4001, 4002)
        // 3. We haven't exceeded max attempts
        // 4. User is still logged in
        if (
          !isIntentionalCloseRef.current &&
          event.code !== 1000 && // Normal closure
          event.code !== 4001 && // Auth error
          event.code !== 4002 && // Auth timeout
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
          session?.user?.accessToken
        ) {
          const delay = Math.min(
            BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
            MAX_RECONNECT_DELAY
          );

          reconnectAttemptsRef.current++;
          console.log(
            `Scheduling reconnection attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.error(
            "Max reconnection attempts reached. Manual refresh required."
          );
          setConnectionState("disconnected");
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionState("disconnected");
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
      setConnectionState("disconnected");
    }
  }, [session?.user?.accessToken, session?.user?.id, queryClient]);

  useEffect(() => {
    if (
      session?.user?.accessToken &&
      ws.current?.readyState !== WebSocket.OPEN 
    ) {
      connect();
    }

    return () => {
      // Clear all timeouts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = null;
      }

      // Close WebSocket gracefully
      if (ws.current) {
        isIntentionalCloseRef.current = true;
        ws.current.close(1000, "Component unmounting");
        ws.current = null;
        setConnectionState("disconnected");
      }
    };
  }, [connect, session?.user?.accessToken]);

  // Reset intentional close flag after cleanup
  useEffect(() => {
    if (
      ws.current?.readyState === WebSocket.OPEN &&
      isAuthenticatedRef.current
    ) {
      isIntentionalCloseRef.current = false;
    }
  }, [connectionState]);

  return { connectionState };
}
