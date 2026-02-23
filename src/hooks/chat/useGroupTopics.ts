import { useQuery } from "@tanstack/react-query";
import { getGroupTopics } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

export const useGroupTopics = (limit: number = 20) => {
  const headers = useAuthHeaders();

  return useQuery({
    queryKey: ["group-topics", limit],
    queryFn: () => getGroupTopics(limit, headers),
    staleTime: 1000 * 60 * 5, // 5 minutes, topics don't change frequently
  });
};
