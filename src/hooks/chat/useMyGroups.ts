import { useQuery } from "@tanstack/react-query";
import { getMyGroups } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { PaginatedGroupListResponse } from "@/src/types/chat.types";

interface UseMyGroupsParams {
  query?: string;
  limit?: number;
  page?: number;
}

export const useMyGroups = (params: UseMyGroupsParams) => {
  const headers = useAuthHeaders();
  const limit = params.limit || 20;
  const page = params.page || 1;
  const offset = (page - 1) * limit;

  return useQuery<PaginatedGroupListResponse>({
    queryKey: ["my-groups", { ...params, page, limit }],
    queryFn: () => getMyGroups({ ...params, limit, offset }, headers),
    // Keep previous data while fetching new data for smooth transitions
    placeholderData: (previousData) => previousData, 
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
