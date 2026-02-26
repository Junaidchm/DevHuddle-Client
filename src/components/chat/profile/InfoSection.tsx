"use client";

import React, { useState } from "react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Clock, Flag, ShieldAlert, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/src/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blockUser, softDeleteConversation, clearChatHistory, reportChat } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import toast from "react-hot-toast";
import { queryKeys } from "@/src/lib/queryKeys";
import { ReportModal } from "./ReportModal";
import { confirmToast } from "@/src/utils/confirmToast";
import { useDeleteGroup } from "@/src/hooks/chat/useGroupMutations";

interface InfoSectionProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
    minimal?: boolean;
    onConversationDeleted?: () => void;
}

export function InfoSection({ conversation, currentUserId, minimal = false, onConversationDeleted }: InfoSectionProps) {
    const queryClient = useQueryClient();
    const [showOptions, setShowOptions] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const authHeaders = useAuthHeaders();
    const isGroup = conversation.type === 'GROUP';
    const participant = !isGroup ? conversation.participants.find(p => p.userId !== currentUserId) : null;
    const isOwner = isGroup && conversation.ownerId === currentUserId;

    const blockMutation = useMutation({
        mutationFn: () => blockUser(participant!.userId, authHeaders),
        onSuccess: () => {
            toast.success("User blocked");

            // Switch UI to blocked state using event ONLY on success
            window.dispatchEvent(new CustomEvent('chat:block_updated', {
                detail: {
                    conversationId: conversation.conversationId,
                    isBlockedByMe: true,
                    isBlockedByThem: conversation.isBlockedByThem ?? false
                }
            }));

            queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages.list(conversation.conversationId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
        },
        onError: () => {
            toast.error("Failed to block user");
        }
    });

    const unblockMutation = useMutation({
        mutationFn: async () => {
            const { unblockUser: unblockApi } = await import("@/src/services/api/chat.service");
            return unblockApi(participant!.userId, authHeaders);
        },
        onSuccess: () => {
            toast.success("User unblocked");

            // Switch UI to unblocked state using event ONLY on success
            window.dispatchEvent(new CustomEvent('chat:block_updated', {
                detail: {
                    conversationId: conversation.conversationId,
                    isBlockedByMe: false,
                    isBlockedByThem: conversation.isBlockedByThem ?? false
                }
            }));

            queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages.list(conversation.conversationId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
        },
        onError: () => {
            toast.error("Failed to unblock user");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => softDeleteConversation(conversation.conversationId, authHeaders),
        onSuccess: () => {
            toast.success("Conversation deleted");
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.conversations.all });
            if (onConversationDeleted) onConversationDeleted();
            // Note: Parent should handle closing or redirecting
        }
    });

    const clearMutation = useMutation({
        mutationFn: () => clearChatHistory(conversation.conversationId, authHeaders),
        onSuccess: () => {
            toast.success("Chat cleared");
            queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages.list(conversation.conversationId) });
        }
    });

    const deleteGroupMutation = useDeleteGroup(conversation.conversationId);

    const handleBlock = () => {
        if (conversation.isBlockedByMe) {
            confirmToast(`Are you sure you want to unblock ${participant?.name}?`, () => {
                unblockMutation.mutate();
            });
        } else {
            confirmToast(`Are you sure you want to block ${participant?.name}?`, () => {
                blockMutation.mutate();
            });
        }
    };

    const handleDelete = () => {
        confirmToast("Are you sure you want to delete this chat? This will remove it for you.", () => {
            deleteMutation.mutate();
        });
    };

    const handleClear = () => {
        confirmToast("Are you sure you want to clear all messages?", () => {
             clearMutation.mutate();
        });
    };

    const handleReport = () => {
        setIsReportModalOpen(true);
    };

    const handleDeleteGroup = () => {
        confirmToast(
            `Are you sure you want to permanently delete "${conversation.name}"? This cannot be undone and all messages will be lost for every member.`,
            () => {
                deleteGroupMutation.mutate(undefined, {
                    onSuccess: () => {
                        if (onConversationDeleted) onConversationDeleted();
                    }
                });
            }
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Bio / Description */}
            {(isGroup ? conversation.description : participant?.bio) && (
                <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        {isGroup ? 'Description' : 'About'}
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground/90">
                        {isGroup ? conversation.description : participant?.bio}
                    </p>
                </div>
            )}

            {/* Meta Info */}
            <div className="px-1 space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <p className="text-xs font-medium">
                        {conversation.createdAt ? (
                            <>Created {formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true })}</>
                        ) : (
                            <>Creation date unknown</>
                        )}
                    </p>
                </div>
            </div>

            {/* Actions Section */}
            <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                    Privacy & Control
                </h4>
                <div className="grid gap-1.5">
                    {!isGroup && (
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 h-11 rounded-xl px-3"
                            onClick={handleBlock}
                            disabled={blockMutation.isPending || unblockMutation.isPending}
                        >
                            {(blockMutation.isPending || unblockMutation.isPending) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ShieldAlert className="w-4 h-4" />
                            )}
                            <span className="text-xs font-bold">
                                {blockMutation.isPending ? "Blocking..." : unblockMutation.isPending ? "Unblocking..." : conversation.isBlockedByMe ? "Unblock User" : "Block User"}
                            </span>
                        </Button>
                    )}
                    
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 h-11 rounded-xl px-3"
                        onClick={handleClear}
                        disabled={clearMutation.isPending}
                    >
                        {clearMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        <span className="text-xs font-bold">
                            {clearMutation.isPending ? "Clearing..." : "Clear Chat History"}
                        </span>
                    </Button>

                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 h-11 rounded-xl px-3"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                    >
                        {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        <span className="text-xs font-bold">
                            {deleteMutation.isPending ? "Deleting..." : "Delete Chat"}
                        </span>
                    </Button>

                    <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 gap-3 h-11 rounded-xl px-3"
                        onClick={handleReport}
                    >
                        <Flag className="w-4 h-4" />
                        <span className="text-xs font-bold">Report {isGroup ? "Group" : (participant?.name || "User")}</span>
                    </Button>

                    {/* Delete Group — owner only */}
                    {isGroup && isOwner && (
                        <>
                            <div className="my-1 border-t border-destructive/20" />
                            <Button 
                                variant="ghost" 
                                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3 h-11 rounded-xl px-3 border border-red-200"
                                onClick={handleDeleteGroup}
                                disabled={deleteGroupMutation.isPending}
                            >
                                {deleteGroupMutation.isPending 
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <AlertTriangle className="w-4 h-4" />
                                }
                                <span className="text-xs font-bold">
                                    {deleteGroupMutation.isPending ? "Deleting group..." : "Delete Group (Owner Only)"}
                                </span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <ReportModal 
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                conversationId={conversation.conversationId}
                targetId={isGroup ? conversation.conversationId : participant!.userId}
                targetType={isGroup ? 'CONVERSATION' : 'USER'}
                targetName={isGroup ? (conversation.name || "Group") : (participant?.name || "User")}
            />
        </div>
    );
}
