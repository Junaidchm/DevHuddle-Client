import { useQuery } from "@tanstack/react-query";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { getChatSuggestions } from "@/src/services/api/chat.service";
import { queryKeys } from "@/src/lib/queryKeys";

export function useChatSuggestions() {
  const authHeaders = useAuthHeaders();

  return useQuery({
    queryKey: queryKeys.chat.suggestions.list(),
    queryFn: () => getChatSuggestions(authHeaders),
    select: (data: any) => {
      // Backend returns { success: true, data: { suggestions: [...] } }
      // Axios response.data is the whole object
      return data?.data?.suggestions || [];
    },
    enabled: !!authHeaders.Authorization,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
