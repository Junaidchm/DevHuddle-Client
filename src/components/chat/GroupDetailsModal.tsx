"use client";

import React, { useState, useEffect } from "react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { 
    X, UserPlus, LogOut, Trash2, Shield, ShieldOff, Crown, Search, Loader2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { cn } from "@/src/lib/utils";
import { 
    useAddParticipants, 
    useRemoveParticipant, 
    usePromoteToAdmin, 
    useDemoteToMember, 
    useLeaveGroup
} from "@/src/hooks/chat/useGroupMutations";
import { useChatSuggestions } from "@/src/hooks/chat/useChatSuggestions";
import toast from "react-hot-toast";
import { confirmToast } from "@/src/utils/confirmToast";
import { useQueryClient } from "@tanstack/react-query";

interface GroupDetailsModalProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function GroupDetailsModal({ conversation, currentUserId, isOpen, onClose }: GroupDetailsModalProps) {
    const [memberSearch, setMemberSearch] = useState("");
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const queryClient = useQueryClient();

    // Check if current user is admin
    const myParticipant = conversation.participants.find(p => p.userId === currentUserId);
    const isAdmin = myParticipant?.role === 'ADMIN' || conversation.ownerId === currentUserId;
    const isOwner = conversation.ownerId === currentUserId;

    // Log for debugging
    console.log('🔍 Group Details Debug:', {
        currentUserId,
        myParticipant,
        isAdmin,
        isOwner,
        ownerId: conversation.ownerId,
        participants: conversation.participants
    });

    // Mutations
    const addParticipantsMutation = useAddParticipants(conversation.conversationId);
    const removeParticipantMutation = useRemoveParticipant(conversation.conversationId);
    const promoteMutation = usePromoteToAdmin(conversation.conversationId);
    const demoteMutation = useDemoteToMember(conversation.conversationId);
    const leaveGroupMutation = useLeaveGroup(conversation.conversationId);

    // Get users for adding
    const { data: rawSuggestions = [] } = useChatSuggestions();
    const eligibleUsers = React.useMemo(() => {
        const existingIds = conversation.participants.map(p => p.userId);
        return rawSuggestions
            .filter((u: any) => !existingIds.includes(u.id))
            .map((u: any) => ({
                id: u.id,
                name: u.fullName || u.name || u.username,
                username: u.username,
                profilePhoto: u.profilePhoto
            }));
    }, [rawSuggestions, conversation.participants]);

    const filteredEligibleUsers = React.useMemo(() => {
        if (!searchQuery.trim()) return eligibleUsers;
        const query = searchQuery.toLowerCase();
        return eligibleUsers.filter((u: any) => 
            u.name.toLowerCase().includes(query) || 
            u.username.toLowerCase().includes(query)
        );
    }, [eligibleUsers, searchQuery]);

    const handleAddParticipants = () => {
        if (selectedUsers.length === 0) return;
        addParticipantsMutation.mutate(selectedUsers, {
            onSuccess: () => {
                setIsAddMemberOpen(false);
                setSelectedUsers([]);
                setSearchQuery("");
                toast.success("Members added successfully");
            }
        });
    };

    const handlePromote = (userId: string) => {
        promoteMutation.mutate(userId, {
            onSuccess: () => toast.success("User promoted to admin")
        });
    };

    const handleDemote = (userId: string) => {
        demoteMutation.mutate(userId, {
            onSuccess: () => toast.success("Admin removed")
        });
    };

    const handleRemove = (userId: string) => {
        confirmToast("Remove this member from the group?", () => {
            removeParticipantMutation.mutate(userId, {
                onSuccess: () => toast.success("Member removed")
            });
        });
    };

    const handleLeaveGroup = () => {
        confirmToast("Are you sure you want to leave this group?", () => {
            leaveGroupMutation.mutate(undefined, {
                onSuccess: onClose
            });
        });
    };

    // Real-time updates
    useEffect(() => {
        const handleUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
        };

        window.addEventListener('group_updated', handleUpdate as EventListener);
        window.addEventListener('role_updated', handleUpdate as EventListener);
        window.addEventListener('participants_added', handleUpdate as EventListener);
        window.addEventListener('participant_removed', handleUpdate as EventListener);

        return () => {
            window.removeEventListener('group_updated', handleUpdate as EventListener);
            window.removeEventListener('role_updated', handleUpdate as EventListener);
            window.removeEventListener('participants_added', handleUpdate as EventListener);
            window.removeEventListener('participant_removed', handleUpdate as EventListener);
        };
    }, [queryClient]);

    // Filter members
    const filteredMembers = conversation.participants.filter(p => {
        if (!memberSearch.trim()) return true;
        const query = memberSearch.toLowerCase();
        return (
            p.name?.toLowerCase().includes(query) ||
            p.username?.toLowerCase().includes(query)
        );
    });

    return (
        <>
            {/* Main Modal */}
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-lg max-h-[85vh] p-0">
                    {/* Header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold">Group Info</DialogTitle>
                        <button onClick={onClose} className="hover:bg-muted rounded-full p-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-6">
                            {/* Group Icon & Name */}
                            <div className="flex flex-col items-center text-center space-y-3">
                                <Avatar className="w-24 h-24 border-2">
                                    <AvatarImage src={conversation.icon || PROFILE_DEFAULT_URL} />
                                    <AvatarFallback className="text-2xl">
                                        {(conversation.name?.[0] || 'G').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{conversation.name}</h3>
                                    {conversation.description && (
                                        <p className="text-sm text-muted-foreground mt-1">{conversation.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Members Section */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">Members ({conversation.participants.length})</h4>
                                    {/* ADD MEMBER BUTTON - ALWAYS SHOW FOR TESTING */}
                                    {isAdmin && (
                                        <Button
                                            size="sm"
                                            onClick={() => setIsAddMemberOpen(true)}
                                            className="gap-2 h-8 text-xs"
                                        >
                                            <UserPlus className="w-3.5 h-3.5" />
                                            Add Member
                                        </Button>
                                    )}
                                </div>

                                {/* Search */}
                                {conversation.participants.length > 5 && (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search members..."
                                            value={memberSearch}
                                            onChange={(e) => setMemberSearch(e.target.value)}
                                            className="pl-9 h-9"
                                        />
                                    </div>
                                )}

                                {/* Member List */}
                                <div className="space-y-1">
                                    {filteredMembers.map(participant => {
                                        const isMe = participant.userId === currentUserId;
                                        const isPartAdmin = participant.role === 'ADMIN' || conversation.ownerId === participant.userId;
                                        const isPartOwner = conversation.ownerId === participant.userId;
                                        
                                        return (
                                            <div 
                                                key={participant.userId}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                                            >
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={participant.profilePhoto || PROFILE_DEFAULT_URL} />
                                                    <AvatarFallback>
                                                        {(participant.name?.[0] || 'U').toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium truncate">
                                                            {isMe ? "You" : participant.name}
                                                        </span>
                                                        
                                                        {/* OWNER BADGE */}
                                                        {isPartOwner && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                                                <Crown className="w-3 h-3" />
                                                                Owner
                                                            </span>
                                                        )}
                                                        
                                                        {/* ADMIN BADGE */}
                                                        {isPartAdmin && !isPartOwner && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                                                <Shield className="w-3 h-3" />
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        @{participant.username}
                                                    </p>
                                                </div>

                                                {/* ADMIN ACTIONS */}
                                                {(isAdmin && !isMe && !isPartOwner) && (() => {
                                                    const isPromotingThisUser = promoteMutation.isPending && promoteMutation.variables === participant.userId;
                                                    const isDemotingThisUser = demoteMutation.isPending && demoteMutation.variables === participant.userId;
                                                    const isRemovingThisUser = removeParticipantMutation.isPending && removeParticipantMutation.variables === participant.userId;
                                                    const anyPending = isPromotingThisUser || isDemotingThisUser || isRemovingThisUser;
                                                    
                                                    return (
                                                        <div className="flex gap-1">
                                                            {/* PROMOTE / DEMOTE BUTTON */}
                                                            {isPartAdmin ? (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDemote(participant.userId)}
                                                                    disabled={anyPending}
                                                                    className="h-8 gap-1.5 text-xs"
                                                                >
                                                                    {isDemotingThisUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                                                    {isDemotingThisUser ? "Removing..." : "Remove Admin"}
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handlePromote(participant.userId)}
                                                                    disabled={anyPending}
                                                                    className="h-8 gap-1.5 text-xs"
                                                                >
                                                                    {isPromotingThisUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Shield className="w-3.5 h-3.5" />}
                                                                    {isPromotingThisUser ? "Making..." : "Make Admin"}
                                                                </Button>
                                                            )}
                                                            
                                                            {/* REMOVE BUTTON */}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRemove(participant.userId)}
                                                                disabled={anyPending}
                                                                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                                                            >
                                                                {isRemovingThisUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                                                {isRemovingThisUser ? "Removing..." : "Remove"}
                                                            </Button>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Exit Group */}
                            <div className="pt-4 border-t">
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 text-destructive hover:text-destructive"
                                    onClick={handleLeaveGroup}
                                    disabled={leaveGroupMutation.isPending}
                                >
                                    {leaveGroupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                    {leaveGroupMutation.isPending ? "Exiting..." : "Exit Group"}
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Add Member Modal */}
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogContent className="max-w-md">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Add Members</h3>
                            <button onClick={() => setIsAddMemberOpen(false)} className="hover:bg-muted rounded-full p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* User List */}
                        <ScrollArea className="h-[300px] border rounded-lg p-2">
                            {filteredEligibleUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <UserPlus className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm">No users available</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredEligibleUsers.map((user: any) => {
                                        const isSelected = selectedUsers.includes(user.id);
                                        return (
                                            <div
                                                key={user.id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                    } else {
                                                        setSelectedUsers([...selectedUsers, user.id]);
                                                    }
                                                }}
                                                className={cn(
                                                    "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50",
                                                    isSelected && "bg-muted"
                                                )}
                                            >
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={user.profilePhoto || PROFILE_DEFAULT_URL} />
                                                    <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary-foreground">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end">
                            <Button 
                                variant="ghost" 
                                onClick={() => {
                                    setIsAddMemberOpen(false);
                                    setSelectedUsers([]);
                                    setSearchQuery("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleAddParticipants}
                                disabled={selectedUsers.length === 0 || addParticipantsMutation.isPending}
                            >
                                {addParticipantsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {addParticipantsMutation.isPending ? "Adding..." : `Add ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}`}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
