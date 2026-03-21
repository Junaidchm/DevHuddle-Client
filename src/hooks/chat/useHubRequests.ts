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
        onMutate: async (requestId: string) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ["hub_join_requests", hubId] });

            // Snapshot previous value
            const previousRequests = queryClient.getQueryData<any[]>(["hub_join_requests", hubId]);

            // Optimistically update
            queryClient.setQueryData<any[]>(["hub_join_requests", hubId], old => 
                old ? old.filter(r => r.id !== requestId) : []
            );

            return { previousRequests };
        },
        onSuccess: (data, requestId, context) => {
            // 1. Refresh requests list
            queryClient.invalidateQueries({ queryKey: ["hub_join_requests", hubId] });
            
            // 2. Refresh conversations list (updates member count)
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });

            // 3. Manually sync participants in cache for "Instant" member list update
            const approvedRequest = context?.previousRequests?.find(r => r.id === requestId);
            if (approvedRequest && approvedRequest.requester) {
                const requesterId = approvedRequest.requesterId;
                const requesterProfile = {
                    userId: requesterId,
                    name: approvedRequest.requester.name || approvedRequest.requester.fullName || "User",
                    username: approvedRequest.requester.username,
                    profilePhoto: approvedRequest.requester.profilePhoto,
                    role: 'MEMBER'
                };

                const updateConvo = (convo: any) => {
                    if ((convo.conversationId || convo.id) === hubId) {
                        const hasParticipants = Array.isArray(convo.participants);
                        const exists = hasParticipants && convo.participants.some((p: any) => p.userId === requesterId);
                        
                        if (!exists) {
                            return {
                                ...convo,
                                memberCount: (convo.memberCount || (hasParticipants ? convo.participants.length : 0)) + 1,
                                participants: hasParticipants 
                                    ? [...convo.participants, requesterProfile] 
                                    : [requesterProfile]
                            };
                        }
                    }
                    return convo;
                };

                // Update List Cache (handles both simple array and infinite query pages)
                queryClient.setQueriesData({ queryKey: queryKeys.chat.conversations.all }, (oldData: any) => {
                    if (!oldData) return oldData;
                    
                    if (Array.isArray(oldData)) return oldData.map(updateConvo);
                    
                    // Handle Infinite Query structure
                    if (oldData.pages) {
                        return {
                            ...oldData,
                            pages: oldData.pages.map((page: any) => ({
                                ...page,
                                data: Array.isArray(page.data) ? page.data.map(updateConvo) : page.data
                            }))
                        };
                    }

                    if (oldData.conversations) return { ...oldData, conversations: oldData.conversations.map(updateConvo) };
                    return oldData;
                });

                // 4. Also update the detail cache if it exists for the current hub
                queryClient.setQueryData(["conversation", hubId], (oldData: any) => {
                    if (!oldData) return oldData;
                    return updateConvo(oldData);
                });
            }

            toast.success("Request approved");
        },
        onError: (error: any, requestId, context) => {
            // Rollback on error
            if (context?.previousRequests) {
                queryClient.setQueryData(["hub_join_requests", hubId], context.previousRequests);
            }
            toast.error(error.response?.data?.message || "Failed to approve request");
        }
    });
};

export const useRejectHubRequest = (hubId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: (requestId: string) => rejectHubJoinRequest(requestId, headers),
        onMutate: async (requestId: string) => {
            await queryClient.cancelQueries({ queryKey: ["hub_join_requests", hubId] });
            const previousRequests = queryClient.getQueryData<any[]>(["hub_join_requests", hubId]);
            queryClient.setQueryData<any[]>(["hub_join_requests", hubId], old => 
                old ? old.filter(r => r.id !== requestId) : []
            );
            return { previousRequests };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hub_join_requests", hubId] });
            toast.success("Request rejected");
        },
        onError: (error: any, requestId, context) => {
            if (context?.previousRequests) {
                queryClient.setQueryData(["hub_join_requests", hubId], context.previousRequests);
            }
            toast.error(error.response?.data?.message || "Failed to reject request");
        }
    });
};
