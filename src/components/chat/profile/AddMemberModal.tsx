"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Search, UserPlus, X, Users } from "lucide-react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { cn } from "@/src/lib/utils";
import { useAddParticipants } from "@/src/hooks/chat/useGroupMutations";
import { useChatSuggestions } from "@/src/hooks/chat/useChatSuggestions";
import { ConversationParticipant } from "@/src/types/chat.types";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversationId: string;
    participants: ConversationParticipant[];
}

export function AddMemberModal({ isOpen, onClose, conversationId, participants }: AddMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    
    // Mutations & Data Hooks
    const addParticipantsMutation = useAddParticipants(conversationId);
    const { data: rawSuggestions = [] } = useChatSuggestions();
    
    // Filter out people already in the group
    const eligibleUsers = React.useMemo(() => {
        const existingIds = participants.map((p) => p.userId);
        return rawSuggestions
            .filter((u: any) => !existingIds.includes(u.id))
            .map((u: any) => ({
                id: u.id,
                name: u.fullName || u.name || u.username,
                username: u.username,
                profilePhoto: u.profilePhoto
            }));
    }, [rawSuggestions, participants]);

    const filteredUsers = React.useMemo(() => {
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
                onClose();
                setSelectedUsers([]);
                setSearchQuery("");
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-border/50 shadow-2xl" showCloseButton={false}>
                <div className="flex flex-col h-[500px]">
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <UserPlus className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold tracking-tight">Add Members</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Select connections to add to the group
                                </DialogDescription>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/80 transition-colors text-muted-foreground">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b border-border/30">
                        <div className="relative group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search your connections..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-muted/30 border-muted hover:bg-muted/50 focus:bg-background transition-colors h-11 rounded-xl"
                            />
                        </div>
                    </div>

                    {/* User List */}
                    <ScrollArea className="flex-1 px-2 py-2">
                        {filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                                <Users className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">No users available</p>
                                <p className="text-xs opacity-70 mt-1 text-center px-6">
                                    All your connections are already in this group or match no search results.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredUsers.map((user: any) => {
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
                                                "flex items-center gap-4 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                                                isSelected 
                                                    ? "bg-primary/10 border border-primary/20" 
                                                    : "hover:bg-muted/50 border border-transparent"
                                            )}
                                        >
                                            <Avatar className={cn(
                                                "w-11 h-11 transition-all duration-300",
                                                isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            )}>
                                                <AvatarImage src={user.profilePhoto || PROFILE_DEFAULT_URL} className="object-cover" />
                                                <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                                                    {user.name?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-sm tracking-tight truncate transition-colors",
                                                    isSelected ? "font-bold text-foreground" : "font-semibold text-foreground/90"
                                                )}>
                                                    {user.name}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground truncate font-medium">
                                                    @{user.username}
                                                </p>
                                            </div>

                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex flex-shrink-0 items-center justify-center border-2 transition-all duration-300",
                                                isSelected 
                                                    ? "bg-primary border-primary" 
                                                    : "border-muted-foreground/30 bg-transparent group-hover:border-primary/50"
                                            )}>
                                                {isSelected && (
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground transform scale-in">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-border/50 bg-muted/10 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                            {selectedUsers.length} user{selectedUsers.length !== 1 && 's'} selected
                        </span>
                        <div className="flex gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                    onClose();
                                    setSelectedUsers([]);
                                    setSearchQuery("");
                                }}
                                className="h-9 px-4 rounded-lg font-medium"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleAddParticipants}
                                disabled={selectedUsers.length === 0 || addParticipantsMutation.isPending}
                                className="h-9 px-5 rounded-lg font-bold shadow-sm"
                            >
                                {addParticipantsMutation.isPending ? "Adding..." : "Add to Group"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
