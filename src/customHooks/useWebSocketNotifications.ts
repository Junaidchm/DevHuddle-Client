'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

interface WebSocketMessage {
  type: 'new_notification' | 'unread_count';
  data: any;
}

export function useWebSocketNotifications() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications?userId=${userId}`);
    setSocket(ws);

    ws.onopen = () => {
      console.log('WebSocket connected for user:', userId);
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      if (message.type === 'new_notification') {
        // Invalidate notifications to refetch
        queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      } else if (message.type === 'unread_count') {
        queryClient.setQueryData(['unreadCount', userId], { unreadCount: message.data.unreadCount });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.close();
    };
  }, [userId, queryClient]);

  return socket;
}