import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
    createGroup, 
    addParticipants, 
    removeParticipant, 
    promoteToAdmin, 
    demoteToMember, 
    updateGroupInfo, 
    leaveGroup,
    deleteGroup,
    joinGroup
} from "@/src/services/api/chat.service";
import { toast } from "sonner";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";

interface CreateGroupVariables {
  name: string;
  participantIds: string[];
  icon?: string;
  topics?: string[];
}

export const useCreateGroup = (onSuccess?: (group: ConversationWithMetadata) => void) => {
  const queryClient = useQueryClient();
  const headers = useAuthHeaders();

  return useMutation({
    mutationFn: async (data: CreateGroupVariables) => {
        const group = await createGroup(data.name, data.participantIds, data.icon, data.topics, headers);
        
        // Map backend response to ConversationWithMetadata
        const mappedGroup: ConversationWithMetadata = {
            conversationId: group.id,
            type: 'GROUP',
            name: group.name || "Group",
            icon: group.icon || undefined,
            description: group.description || undefined,
            ownerId: group.ownerId || undefined,
            participantIds: (group as any).participants?.map((p: any) => p.userId) || [],
            participants: (group as any).participants?.map((p: any) => ({
                userId: p.userId,
                username: p.username || p.user?.username || "user",
                name: p.name || p.user?.fullName || p.user?.name || "User",
                profilePhoto: p.profilePhoto || p.user?.profilePhoto,
                role: p.role,
                // Add default values for required Participant fields
                conversationId: group.id,
                createdAt: new Date().toISOString(),
                lastReadAt: new Date().toISOString()
            })) || [],
            lastMessage: null,
            lastMessageAt: (group.createdAt as any) instanceof Date ? (group.createdAt as any).toISOString() : (group.createdAt as any),
            unreadCount: 0,
            // Add missing fields
            onlyAdminsCanPost: group.onlyAdminsCanPost,
            onlyAdminsCanEditInfo: group.onlyAdminsCanEditInfo
        };
        
        return mappedGroup;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Group created successfully");
      if (onSuccess) onSuccess(data);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create group");
    },
  });
};

export const useAddParticipants = (groupId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: (userIds: string[]) => addParticipants(groupId, userIds, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] }); // Refresh list
            // Also invalidate specific group details if we had a query for that
            toast.success("Participants added");
        },
        onError: (error: any) => toast.error(error.message || "Failed to add participants")
    });
};

export const useRemoveParticipant = (groupId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: (userId: string) => removeParticipant(groupId, userId, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Participant removed");
        },
        onError: (error: any) => toast.error(error.message || "Failed to remove participant")
    });
};

export const usePromoteToAdmin = (groupId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: (userId: string) => promoteToAdmin(groupId, userId, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Promoted to admin");
        },
        onError: (error: any) => toast.error(error.message || "Failed to promote")
    });
};

export const useDemoteToMember = (groupId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: (userId: string) => demoteToMember(groupId, userId, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Demoted to member");
        },
        onError: (error: any) => toast.error(error.message || "Failed to demote")
    });
};

interface UpdateGroupInfoData {
    name?: string;
    description?: string;
    icon?: string;
    onlyAdminsCanPost?: boolean;
    onlyAdminsCanEditInfo?: boolean;
}

export const useUpdateGroupInfo = (groupId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: (data: UpdateGroupInfoData) => updateGroupInfo(groupId, data, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Group info updated");
        },
        onError: (error: any) => toast.error(error.message || "Failed to update group info")
    });
};

export const useLeaveGroup = (groupId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: () => leaveGroup(groupId, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Left group");
        },
        onError: (error: any) => toast.error(error.message || "Failed to leave group")
    });
};

export const useDeleteGroup = (groupId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();

    return useMutation({
        mutationFn: () => deleteGroup(groupId, headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Group deleted successfully");
        },
        onError: (error: any) => toast.error(error.message || "Failed to delete group")
    });
};

export const useJoinGroup = (groupId: string) => {
    const queryClient = useQueryClient();
    const headers = useAuthHeaders();
    const { userId } = useAuthHeaders(); // Need userId to pass to joinGroup if required, but service handles logic. 
    // Wait, joinGroup in service takes userIds array. The current user is the one joining.
    // I need to pass current user ID. 
    // actually service: joinGroup(groupId, userIds, headers)
    // I should probably just pass [currentUserId].
    // But how do I get currentUserId easily here? 
    // useAuthHeaders returns { "x-user-data": ... }. I can parse it or passed as arg.
    // Let's passed userId as argument to mutation.

    return useMutation({
        mutationFn: (userId: string) => joinGroup(groupId, [userId], headers),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
            toast.success("Joined group successfully");
        },
        onError: (error: any) => toast.error(error.message || "Failed to join group")
    });
};
