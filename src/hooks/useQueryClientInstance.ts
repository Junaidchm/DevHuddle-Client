/**
 * ✅ Hook to get the QueryClient instance
 * Used for clearing cache on logout
 */
import { useQueryClient } from "@tanstack/react-query";

export function useQueryClientInstance() {
  return useQueryClient();
}

