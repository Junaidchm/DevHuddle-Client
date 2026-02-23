"use client";

import React from "react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { useQuery } from "@tanstack/react-query";
import { getCommonGroups } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { Loader2, Users, Shield, Crown, UserPlus, MoreHorizontal, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { 
    useRemoveParticipant, 
    usePromoteToAdmin, 
    useDemoteToMember
} from "@/src/hooks/chat/useGroupMutations";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu";
import { AddMemberModal } from "./AddMemberModal";
import { useState } from "react";

interface GroupsSectionProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
}

export function GroupsSection({ conversation, currentUserId }: GroupsSectionProps) {
    const authHeaders = useAuthHeaders();
    const isGroup = conversation.type === 'GROUP';
    const participant = !isGroup ? conversation.participants.find(p => p.userId !== currentUserId) : null;

    // Fetch common groups if it's a DIRECT chat
    const { data: commonGroups = [], isLoading } = useQuery({
        queryKey: ['common-groups', participant?.userId],
        queryFn: () => getCommonGroups(participant!.userId, authHeaders),
        enabled: !isGroup && !!participant?.userId && !!authHeaders.Authorization,
    });

    // Group Management State
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    
    // Admin Verification
    const myParticipant = conversation.participants?.find(p => p.userId === currentUserId);
    const iAmAdmin = myParticipant?.role === 'ADMIN' || conversation.ownerId === currentUserId;

    // Mutations
    const removeParticipantMutation = useRemoveParticipant(conversation.conversationId);
    const promoteMutation = usePromoteToAdmin(conversation.conversationId);
    const demoteMutation = useDemoteToMember(conversation.conversationId);

    if (!isGroup && isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isGroup) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Members ({conversation.participants.length})
                    </h4>
                    {iAmAdmin && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-[10px] font-bold gap-1.5 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                            onClick={() => setIsAddMemberOpen(true)}
                        >
                            <UserPlus className="w-3 h-3" />
                            Add User
                        </Button>
                    )}
                </div>

                <div className="space-y-1">
                    {conversation.participants.map((p) => {
                        const isOwner = p.userId === conversation.ownerId;
                        const isAdmin = p.role === 'ADMIN' || isOwner;
                        
                        return (
                            <div key={p.userId} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group">
                                <Avatar className="w-9 h-9 border border-border/50 shrink-0">
                                    <AvatarImage src={p.profilePhoto || PROFILE_DEFAULT_URL} className="object-cover" />
                                    <AvatarFallback className="text-[10px]">{p.name?.[0] || p.username?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-semibold truncate">
                                            {p.userId === currentUserId ? "You" : (p.name || p.username)}
                                        </p>
                                        {isOwner && (
                                            <span className="shrink-0 p-0.5 rounded-md bg-amber-500/10 text-amber-600" title="Group Owner">
                                                <Crown className="w-2.5 h-2.5" />
                                            </span>
                                        )}
                                        {isAdmin && !isOwner && (
                                            <span className="shrink-0 p-0.5 rounded-md bg-blue-500/10 text-blue-600" title="Group Admin">
                                                <Shield className="w-2.5 h-2.5" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate font-medium">@{p.username}</p>
                                </div>
                                
                                {/* Admin Controls Menu */}
                                {iAmAdmin && p.userId !== currentUserId && !isOwner && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                                    <MoreHorizontal className="w-3.5 h-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                {isAdmin ? (
                                                    <DropdownMenuItem onClick={() => demoteMutation.mutate(p.userId)} className="text-xs">
                                                        <ShieldOff className="w-3.5 h-3.5 mr-2" /> Dismiss as Admin
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => promoteMutation.mutate(p.userId)} className="text-xs">
                                                        <Shield className="w-3.5 h-3.5 mr-2" /> Make Group Admin
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs"
                                                    onClick={() => removeParticipantMutation.mutate(p.userId)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Remove from Group
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                {/* Add Member Modal logic lives outside the loop */}
                {iAmAdmin && (
                    <AddMemberModal 
                        isOpen={isAddMemberOpen} 
                        onClose={() => setIsAddMemberOpen(false)} 
                        conversationId={conversation.conversationId} 
                        participants={conversation.participants}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                Groups in Common ({commonGroups.length})
            </h4>
            
            {commonGroups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                    <Users className="w-12 h-12 mb-4" />
                    <p className="text-sm font-medium">No common groups</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {commonGroups.map((group: any) => (
                        <div key={group.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all group cursor-pointer">
                            <Avatar className="w-10 h-10 rounded-xl">
                                <AvatarImage src={group.icon || PROFILE_DEFAULT_URL} className="object-cover" />
                                <AvatarFallback>{group.name?.[0] || 'G'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{group.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {group.participants?.length || 0} members
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
