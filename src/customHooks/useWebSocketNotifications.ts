"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";


export function useWebSocketNotifications() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (session?.user?.accessToken && !ws.current) {
      const token = session.user.accessToken;
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/notifications?token=${token}`;

      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established");
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log("Received message:", message);

        switch (message.type) {
          case "new_notification":
            toast.success(message.data.summary.text);
            queryClient.invalidateQueries({ queryKey: ["notifications",session.user.id] });
            queryClient.invalidateQueries({ queryKey: ["unread-count",session.user.id] });
            break;
          case "unread_count":
            console.log('this call for unread count is actually working without any problem ----------------->',message.data.unreadCount)
            queryClient.setQueryData(["unread-count", session.user.id], {
              unreadCount: message.data.unreadCount,
            });
            break;
          default:
            break;
        }
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        ws.current = null;
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        socket.close();
      };

      return () => {
        if (ws.current) {
          ws.current.close();
          ws.current = null;
        }
      };
    }
  }, [session?.user?.accessToken, session?.user?.id]);
}