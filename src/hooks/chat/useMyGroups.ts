import { useQuery } from "@tanstack/react-query";
import { getMyGroups } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { GroupListDto } from "@/src/types/chat.types";

interface UseMyGroupsParams {
  query?: string;
  limit?: number;
  offset?: number;
}

export const useMyGroups = (params: UseMyGroupsParams) => {
  const headers = useAuthHeaders();

  return useQuery({
    queryKey: ["my-groups", params],
    queryFn: () => getMyGroups(params, headers),
    // Keep previous data while fetching new data for smooth transitions
    placeholderData: (previousData) => previousData, 
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
