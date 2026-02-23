"use client";

import React, { useState, useEffect } from "react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { X, Mail, Calendar, User as UserIcon, Trash2, ShieldAlert, Clock, MoreVertical } from "lucide-react";
import { Separator } from "@/src/components/ui/separator";
import { MediaLinksDocs } from "./MediaLinksDocs";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/src/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommonGroups, blockUser, unblockUser, softDeleteConversation, clearChatHistory } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { toast } from "react-hot-toast";
import { queryKeys } from "@/src/lib/queryKeys";
import { confirmToast } from "@/src/utils/confirmToast";

interface UserProfileProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
    onClose: () => void;
    onConversationDeleted?: () => void;
}

export function UserProfile({ conversation, currentUserId, onClose, onConversationDeleted }: UserProfileProps) {
    const queryClient = useQueryClient();
    const authHeaders = useAuthHeaders();
    const participant = conversation.participants.find(p => p.userId !== currentUserId);

    // Fetch common groups
    const { data: commonGroups = [] } = useQuery({
        queryKey: ['common-groups', participant?.userId],
        queryFn: () => getCommonGroups(participant!.userId, authHeaders),
        enabled: !!participant?.userId && !!authHeaders.Authorization,
    });

    // Mutations
    const blockMutation = useMutation({
        mutationFn: () => blockUser(participant!.userId, authHeaders),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys.chat.conversations.all });
            const previousConversations = queryClient.getQueryData(queryKeys.chat.conversations.list());

            queryClient.setQueriesData(
                { queryKey: queryKeys.chat.conversations.list() },
                (oldData: any) => {
                    if (!oldData || !oldData.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((p: any) => 
                                p.conversationId === conversation.conversationId
                                    ? { ...p, isBlockedByMe: true }
                                    : p
                            )
                        }))
                    };
                }
            );

            // Immediately update selectedConversation in ChatPage via event
            window.dispatchEvent(new CustomEvent('chat:block_updated', {
                detail: {
                    conversationId: conversation.conversationId,
                    isBlockedByMe: true,
                    isBlockedByThem: conversation.isBlockedByThem ?? false
                }
            }));

            return { previousConversations };
        },
        onSuccess: () => {
            toast.success("User blocked");
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
        },
        onError: (err, variables, context) => {
            toast.error("Failed to block user");
            if (context?.previousConversations) {
                queryClient.setQueryData(queryKeys.chat.conversations.list(), context.previousConversations);
            }
        }
    });

    const unblockMutation = useMutation({
        mutationFn: () => unblockUser(participant!.userId, authHeaders),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys.chat.conversations.all });
            const previousConversations = queryClient.getQueryData(queryKeys.chat.conversations.list());

            queryClient.setQueriesData(
                { queryKey: queryKeys.chat.conversations.list() },
                (oldData: any) => {
                    if (!oldData || !oldData.pages) return oldData;
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page: any) => ({
                            ...page,
                            data: page.data.map((p: any) => 
                                p.conversationId === conversation.conversationId
                                    ? { ...p, isBlockedByMe: false }
                                    : p
                            )
                        }))
                    };
                }
            );

            // Immediately update selectedConversation in ChatPage via event
            window.dispatchEvent(new CustomEvent('chat:block_updated', {
                detail: {
                    conversationId: conversation.conversationId,
                    isBlockedByMe: false,
                    isBlockedByThem: conversation.isBlockedByThem ?? false
                }
            }));

            return { previousConversations };
        },
        onSuccess: () => {
            toast.success("User unblocked");
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
        },
        onError: (err, variables, context) => {
            toast.error("Failed to unblock user");
            if (context?.previousConversations) {
                queryClient.setQueryData(queryKeys.chat.conversations.list(), context.previousConversations);
            }
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => softDeleteConversation(conversation.conversationId, authHeaders),
        onSuccess: () => {
            toast.success("Conversation deleted");
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
            if (onConversationDeleted) onConversationDeleted();
            onClose();
        },
        onError: () => toast.error("Failed to delete conversation")
    });

    const clearMutation = useMutation({
        mutationFn: () => clearChatHistory(conversation.conversationId, authHeaders),
        onSuccess: () => {
            toast.success("Chat cleared");
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages.list(conversation.conversationId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
        },
        onError: () => toast.error("Failed to clear chat")
    });

    const handleBlockToggle = () => {
        if (conversation.isBlockedByMe) {
            unblockMutation.mutate();
        } else {
            confirmToast(`Are you sure you want to block ${participant?.name}?`, () => {
                blockMutation.mutate();
            });
        }
    };

    const handleDelete = () => {
        confirmToast("Are you sure you want to delete this conversation? This will remove it from your list.", () => {
            deleteMutation.mutate();
        });
    };

    const handleClear = () => {
        confirmToast("Are you sure you want to clear this chat? This will remove all messages for you.", () => {
            clearMutation.mutate();
        });
    };

    if (!participant) {
        return (
            <div className="w-[350px] border-l border-border bg-background flex flex-col h-full absolute right-0 top-0 bottom-0 z-20 shadow-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg">Contact Info</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-muted-foreground text-center mt-10">User not found</p>
            </div>
        );
    }

    return (
        <div className="w-[350px] border-l border-border bg-background flex flex-col h-full absolute right-0 top-0 bottom-0 z-20 shadow-xl transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                    Contact Info
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                {/* Profile Overview */}
                <div className="p-8 flex flex-col items-center bg-background/50 backdrop-blur-sm relative">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-xl mb-4 relative ring-2 ring-primary/10">
                        <AvatarImage 
                            src={participant.profilePhoto || PROFILE_DEFAULT_URL} 
                            className="object-cover"
                        />
                        <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                            {participant.name?.[0]?.toUpperCase() || participant.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                        {participant.isOnline && (
                             <div className="absolute right-2 bottom-2 w-6 h-6 bg-green-500 border-4 border-background rounded-full shadow-md" />
                        )}
                    </Avatar>
                    
                    <h3 className="text-2xl font-bold text-foreground text-center break-words w-full px-4">
                        {participant.name}
                    </h3>
                    <div className="flex flex-col items-center gap-1 mt-1">
                        <p className="text-muted-foreground text-sm font-medium">@{participant.username}</p>
                        {participant.isOnline ? (
                            <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/5 px-2 py-0 h-5">Online</Badge>
                        ) : participant.lastSeen ? (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Last seen {formatDistanceToNow(new Date(participant.lastSeen), { addSuffix: true })}
                            </p>
                        ) : null}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-4 mt-6">
                        <Button variant="outline" size="icon" className="rounded-full w-12 h-12 hover:bg-primary/5 hover:text-primary transition-colors">
                            <Mail className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full w-12 h-12 hover:bg-orange-500/5 hover:text-orange-500 transition-colors">
                            <ShieldAlert className="w-5 h-5" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full w-12 h-12 hover:bg-destructive/5 hover:text-destructive transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full w-12 h-12">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="space-y-6 pb-12">
                     {/* Bio Section */}
                    {participant.bio && (
                        <div className="px-6 py-4 border-t border-border bg-card/30">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h4>
                            <p className="text-sm leading-relaxed text-foreground/80">{participant.bio}</p>
                        </div>
                    )}

                    {/* Shared Content */}
                    <MediaLinksDocs conversationId={conversation.conversationId} />

                    {/* Groups in Common */}
                    <div className="px-6 py-4 border-t border-border">
                         <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                             {commonGroups.length} {commonGroups.length === 1 ? 'Group' : 'Groups'} in common
                         </h4>
                         <div className="space-y-4">
                             {commonGroups.length > 0 ? (
                                 commonGroups.map((group: any) => (
                                     <div key={group.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg cursor-pointer group transition-colors">
                                         <Avatar className="w-10 h-10">
                                             <AvatarImage src={group.icon || PROFILE_DEFAULT_URL} className="object-cover" />
                                             <AvatarFallback className="bg-muted text-muted-foreground">
                                                 {group.name?.[0]?.toUpperCase() || "G"}
                                             </AvatarFallback>
                                         </Avatar>
                                         <div className="flex-1 min-w-0">
                                             <p className="text-sm font-medium truncate">{group.name}</p>
                                             <p className="text-xs text-muted-foreground">
                                                 {group.participantCount || 0} participants
                                             </p>
                                         </div>
                                     </div>
                                 ))
                             ) : (
                                 <p className="text-sm text-muted-foreground text-center py-4 bg-muted/20 rounded-lg border border-dashed border-border text-xs">No groups in common</p>
                             )}
                         </div>
                    </div>

                    {/* Privacy Actions */}
                    <div className="px-6 py-2 border-t border-border space-y-1">
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 font-medium h-12"
                            onClick={handleBlockToggle}
                            disabled={blockMutation.isPending || unblockMutation.isPending}
                        >
                            <ShieldAlert className="w-5 h-5" />
                            {blockMutation.isPending || unblockMutation.isPending 
                                ? "Processing..." 
                                : conversation.isBlockedByMe 
                                    ? `Unblock ${participant.name}` 
                                    : `Block ${participant.name}`
                            }
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 font-medium h-12"
                            onClick={handleClear}
                            disabled={clearMutation.isPending}
                        >
                            <Trash2 className="w-5 h-5" />
                            {clearMutation.isPending ? "Clearing..." : "Clear Chat"}
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 font-medium h-12"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash2 className="w-5 h-5" />
                            {deleteMutation.isPending ? "Deleting..." : "Delete Chat"}
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
