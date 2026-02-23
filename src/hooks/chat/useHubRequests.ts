import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
    getHubJoinRequests, 
    approveHubJoinRequest, 
    rejectHubJoinRequest 
} from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { toast } from "sonner";

import { queryKeys } from "@/src/lib/queryKeys";

export const useHubRequests = (hubId: string) => {
    const headers = useAuthHeaders();
    
    return useQuery({
        queryKey: ["hub_join_requests", hubId],
        queryFn: () => getHubJoinRequests(hubId, headers),
        enabled: !!hubId && !!headers.Authorization,
        refetchInterval: 30000, // Refetch every 30 seconds
    });
};

export const useApproveHubRequest = (hubId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: (requestId: string) => approveHubJoinRequest(requestId, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hub_join_requests", hubId] });
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all }); // Update member list/count
            toast.success("Request approved");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to approve request");
        }
    });
};

export const useRejectHubRequest = (hubId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: (requestId: string) => rejectHubJoinRequest(requestId, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hub_join_requests", hubId] });
            toast.success("Request rejected");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to reject request");
        }
    });
};
