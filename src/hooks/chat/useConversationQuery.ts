// import { useQuery } from "@tanstack/react-query";
// import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
// import { getUserConversations } from "@/src/services/api/chat.service";
// import { queryKeys } from "@/src/lib/queryKeys";
// export function useConversationsQuery() {
//   const authHeaders = useAuthHeaders();
//   return useQuery({
//     queryKey: queryKeys.chat.conversations.list(),
//     queryFn: () => getUserConversations(authHeaders),
//     enabled: !!authHeaders.Authorization, // Only fetch when authenticated
//     staleTime: 30000, // 30 seconds
//   });
// }