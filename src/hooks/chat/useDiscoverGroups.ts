import { useQuery } from "@tanstack/react-query";
import { getDiscoverGroups } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { PaginatedGroupListResponse } from "@/src/types/chat.types";

interface UseDiscoverGroupsParams {
  query?: string;
  topics?: string[];
  limit?: number;
  page?: number;
}

export const useDiscoverGroups = (params: UseDiscoverGroupsParams) => {
  const headers = useAuthHeaders();
  const limit = params.limit || 20;
  const page = params.page || 1;
  const offset = (page - 1) * limit;

  return useQuery<PaginatedGroupListResponse>({
    queryKey: ["discover-groups", { ...params, page, limit }],
    queryFn: async () => {
        return getDiscoverGroups({ ...params, limit, offset }, headers);
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
