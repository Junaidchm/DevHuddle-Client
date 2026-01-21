"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyConnections, SearchedUser } from "@/src/services/api/user.service";
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
    queryKey: queryKeys.users.connections,
    queryFn: async () => {
      try {
        const users: SearchedUser[] = await getMyConnections(authHeaders);
        
        // Map SearchedUser to Connection
        const connections: Connection[] = users.map(u => ({
          id: u.id,
          name: u.name,
          username: u.username,
          profilePicture: u.profilePicture || u.avatar || null,
          headline: u.headline || null,
          jobTitle: u.jobTitle || null,
          company: u.company || null,
        }));

        console.log("[useConnections] Fetched connections:", connections.length);
        return connections;
      } catch (error: any) {
        console.error("[useConnections] Error fetching connections:", error);
        throw error;
      }
    },
    enabled: enabled && !!authHeaders.Authorization,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: 1000,
  });
}

