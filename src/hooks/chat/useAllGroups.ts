import { useQuery } from "@tanstack/react-query";
import { getAllGroups } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { PaginatedGroupsResponse } from "@/src/types/chat.types";

interface UseAllGroupsParams {
  query?: string;
  topics?: string[];
  limit?: number;
  page?: number;
}

export const useAllGroups = (params: UseAllGroupsParams) => {
  const headers = useAuthHeaders();
  const limit = params.limit || 20;
  const page = params.page || 1;
  const offset = (page - 1) * limit;

  return useQuery<PaginatedGroupsResponse>({
    queryKey: ["all-groups", { ...params, page, limit }],
    queryFn: () => getAllGroups({ ...params, limit, offset }, headers),
    // Keep previous data while fetching new data for smooth transitions
    placeholderData: (previousData) => previousData, 
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
