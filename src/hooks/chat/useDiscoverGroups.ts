import { useInfiniteQuery } from "@tanstack/react-query";
import { getDiscoverGroups } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { GroupListDto } from "@/src/types/chat.types";

interface UseDiscoverGroupsParams {
  query?: string;
  topics?: string[];
  limit?: number;
}

export const useDiscoverGroups = (params: UseDiscoverGroupsParams) => {
  const headers = useAuthHeaders();
  const limit = params.limit || 20;

  return useInfiniteQuery({
    queryKey: ["discover-groups", params],
    queryFn: async ({ pageParam = 0 }) => {
        return getDiscoverGroups({ ...params, limit, offset: pageParam }, headers);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned fewer items than the limit, we're at the end
      if (lastPage.length < limit) {
        return undefined;
      }
      // Otherwise calculate the next offset
      return allPages.length * limit;
    },
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
