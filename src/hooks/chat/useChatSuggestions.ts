import { useQuery } from "@tanstack/react-query";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { getChatSuggestions } from "@/src/services/api/chat.service";
import { queryKeys } from "@/src/lib/queryKeys";
import { ChatSuggestionsResponse, ChatSuggestionUser } from "@/src/types/chat";

export function useChatSuggestions() {
  const authHeaders = useAuthHeaders();

  return useQuery<ChatSuggestionsResponse, Error, ChatSuggestionUser[]>({
    queryKey: queryKeys.chat.suggestions.list(),
    queryFn: () => getChatSuggestions(authHeaders),
    select: (data: ChatSuggestionsResponse) => {
      // Backend returns { success: true, data: { suggestions: [...] } }
      // Axios response.data is the whole object
      return data?.data?.suggestions || [];
    },
    enabled: !!authHeaders.Authorization,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
