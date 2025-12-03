"use client";

import { useQuery } from "@tanstack/react-query";
import { getConnections } from "@/src/services/api/engagement.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { Connection } from "@/src/app/types/feed";
import { queryKeys } from "@/src/lib/queryKeys";
import useGetUserData from "@/src/customHooks/useGetUserData";

/**
 * Hook to fetch user connections (people the user follows)
 * Used for the Send Post modal
 * 
 * @param enabled - Whether to fetch connections (default: true)
 *                  Set to false to prevent automatic fetching
 */
export function useConnections(enabled: boolean = true) {
  const authHeaders = useAuthHeaders();
  const currentUser = useGetUserData();
  const userId = currentUser?.id;

  return useQuery<Connection[]>({
    queryKey: queryKeys.engagement.connections.all(userId),
    queryFn: async () => {
      try {
        const response = await getConnections(authHeaders);
        const connections = response.data || [];
        console.log("[useConnections] Fetched connections:", connections.length);
        return connections;
      } catch (error: any) {
        console.error("[useConnections] Error fetching connections:", error);
        throw error;
      }
    },
    enabled: enabled && !!authHeaders.Authorization && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: 1000,
  });
}

