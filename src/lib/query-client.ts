/**
 * ✅ PRODUCTION-READY: React Query Client Configuration
 * 
 * Production defaults:
 * - 1 minute staleTime (data fresh for 1 min)
 * - 5 minute cacheTime (keep in cache for 5 min)
 * - Retry once on failure
 * - Refetch on window focus disabled (prevents excessive requests)
 */

import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });
}

/**
 * Admin-specific query hook with automatic auth checks
 * 
 * Usage:
 * ```ts
 * const { data, isLoading } = useAdminQuery(
 *   ["users", page, limit],
 *   () => apiClient.get('/api/users')
 * );
 * ```
 */
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export function useAdminQuery<TData = unknown, TError = Error>(
  queryKey: any[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn" | "enabled">
) {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "superAdmin";
  const isReady = status !== "loading";

  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    ...options,
    enabled: isReady && isAdmin && (options?.enabled !== false),
  });
}

