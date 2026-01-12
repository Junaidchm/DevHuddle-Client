/**
 * WebSocket Hook
 * Manages WebSocket connection with authentication and message handling
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, Message } from '@/src/types/chat.types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/v1/chat';
const AUTH_TIMEOUT = 5000; // 5 seconds
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 3000; // 3 seconds

interface UseWebSocketOptions {
  token: string | null;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isAuthenticated: boolean;
  sendMessage: (recipientIds: string[], content: string) => void;
  sendTyping: (conversationId: string) => void;
  sendStopTyping: (conversationId: string) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useWebSocket({
  token,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      authTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);

        switch (message.type) {
          case 'auth_success':
            setIsAuthenticated(true);
            if (authTimeoutRef.current) {
              clearTimeout(authTimeoutRef.current);
              authTimeoutRef.current = null;
            }
            startHeartbeat();
            console.log('✅ WebSocket authenticated');
            break;

          case 'auth_error':
            console.error('❌ WebSocket authentication failed');
            setIsAuthenticated(false);
            wsRef.current?.close(4001, 'Unauthorized');
            break;

          case 'heartbeat_ack':
            // Silent acknowledgment
            break;

          case 'error':
            console.error('WebSocket error:', message.error);
            break;

          default:
            // Pass all messages to the handler
            onMessage?.(message);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    },
    [onMessage, startHeartbeat]
  );

  const authenticate = useCallback(() => {
    if (!token || !wsRef.current) return;

    // Set auth timeout
    authTimeoutRef.current = setTimeout(() => {
      if (!isAuthenticated) {
        console.error('Authentication timeout');
        wsRef.current?.close(4001, 'Auth timeout');
      }
    }, AUTH_TIMEOUT);

    // Send auth message
    wsRef.current.send(
      JSON.stringify({
        type: 'auth',
        token,
      })
    );
  }, [token, isAuthenticated]);

  const connect = useCallback(() => {
    if (!token) {
      console.warn('Cannot connect: no token provided');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      console.log('🔌 Connecting to WebSocket...');
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        onConnect?.();
        authenticate();
      };

      ws.onmessage = handleMessage;

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed: ${event.code} ${event.reason}`);
        setIsConnected(false);
        setIsAuthenticated(false);
        clearTimers();
        onDisconnect?.();

        // Auto-reconnect if not manually disconnected
        if (shouldReconnectRef.current && token) {
          console.log(`Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [token, authenticate, handleMessage, onConnect, onDisconnect, onError, clearTimers]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearTimers();
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsAuthenticated(false);
  }, [clearTimers]);

  const reconnect = useCallback(() => {
    shouldReconnectRef.current = true;
    disconnect();
    setTimeout(() => {
      connect();
    }, 500);
  }, [connect, disconnect]);

  const sendMessage = useCallback((recipientIds: string[], content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message: WebSocket not connected');
      return;
    }

    if (!isAuthenticated) {
      console.error('Cannot send message: not authenticated');
      return;
    }

    wsRef.current.send(
      JSON.stringify({
        type: 'send_message',
        recipientIds,
        content,
      })
    );
  }, [isAuthenticated]);

  const sendTyping = useCallback((conversationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
      wsRef.current.send(
        JSON.stringify({
          type: 'typing',
          data: { conversationId },
        })
      );
    }
  }, [isAuthenticated]);

  const sendStopTyping = useCallback((conversationId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
      wsRef.current.send(
        JSON.stringify({
          type: 'stop_typing',
          data: { conversationId },
        })
      );
    }
  }, [isAuthenticated]);

  // Connect on mount if token is available
  useEffect(() => {
    if (token) {
      connect();
    }

    return () => {
      shouldReconnectRef.current = false;
      clearTimers();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
      }
    };
  }, [token, connect, clearTimers]);

  return {
    isConnected,
    isAuthenticated,
    sendMessage,
    sendTyping,
    sendStopTyping,
    disconnect,
    reconnect,
  };
}
