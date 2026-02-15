import { useQuery } from "@tanstack/react-query";
import { getAllGroups } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { ConversationWithMetadata } from "@/src/types/chat.types";

interface UseAllGroupsParams {
  query?: string;
  topics?: string[];
  limit?: number;
  offset?: number;
}

export const useAllGroups = (params: UseAllGroupsParams) => {
  const headers = useAuthHeaders();

  return useQuery({
    queryKey: ["all-groups", params],
    queryFn: () => getAllGroups(params, headers),
    // Keep previous data while fetching new data for smooth transitions
    placeholderData: (previousData) => previousData, 
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
