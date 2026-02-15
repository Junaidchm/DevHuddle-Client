"use client";

import React, { useState } from "react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { 
    X, Camera, UserPlus, LogOut, Trash2, Shield, ShieldOff, MoreHorizontal, PenLine, Users, Search 
} from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/src/components/ui/dialog";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { cn } from "@/src/lib/utils";
import { 
    useAddParticipants, 
    useRemoveParticipant, 
    usePromoteToAdmin, 
    useDemoteToMember, 
    useLeaveGroup,
    useUpdateGroupInfo,
    useDeleteGroup
} from "@/src/hooks/chat/useGroupMutations";
import { useChatSuggestions } from "@/src/hooks/chat/useChatSuggestions";
import { toast } from "sonner";
import { Separator } from "@/src/components/ui/separator";

interface GroupInfoProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
    onClose: () => void;
}

export function GroupInfo({ conversation, currentUserId, onClose }: GroupInfoProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [groupName, setGroupName] = useState(conversation.name || "");
    const [groupDesc, setGroupDesc] = useState(conversation.description || "");
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    // Permissions
    const myParticipant = conversation.participants.find(p => p.userId === currentUserId);
    const isAdmin = myParticipant?.role === 'ADMIN' || conversation.ownerId === currentUserId;
    const isOwner = conversation.ownerId === currentUserId;

    // Mutations
    const addParticipantsMutation = useAddParticipants(conversation.conversationId);
    const removeParticipantMutation = useRemoveParticipant(conversation.conversationId);
    const promoteMutation = usePromoteToAdmin(conversation.conversationId);
    const demoteMutation = useDemoteToMember(conversation.conversationId);
    const updateInfoMutation = useUpdateGroupInfo(conversation.conversationId);
    const leaveGroupMutation = useLeaveGroup(conversation.conversationId);
    const deleteGroupMutation = useDeleteGroup(conversation.conversationId);

    const handleUpdateInfo = () => {
        if (!groupName.trim()) return;
        updateInfoMutation.mutate({ 
            name: groupName, 
            description: groupDesc 
        }, {
            onSuccess: () => setIsEditMode(false)
        });
    };

    // Add Member Dialog Logic
    const { data: rawSuggestions = [] } = useChatSuggestions(); 
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    
    // Filter out existing participants
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
                setIsAddMemberOpen(false);
                setSelectedUsers([]);
                setSearchQuery("");
            }
        });
    };

    const handleLeaveGroup = () => {
        // Prevent leaving if last admin, unless owner (owner deletion handled separately)
        // Actually owner can't leave via this button if we hide it? 
        // Logic: if Admin and only 1 admin, must promote someone else first.
        const admins = conversation.participants.filter(p => p.role === 'ADMIN' || conversation.ownerId === p.userId);
        if (isAdmin && admins.length === 1 && conversation.participants.length > 1) {
            toast.error("Assign another admin before leaving");
            return;
        }

        if (confirm("Are you sure you want to leave this group?")) {
            leaveGroupMutation.mutate(undefined, {
                onSuccess: onClose
            });
        }
    };

     const handleDeleteGroup = () => {
        if (confirm("Are you sure you want to delete this group? This action cannot be undone and will remove the group for all participants.")) {
            deleteGroupMutation.mutate(undefined, {
                onSuccess: onClose
            });
        }
    };

    return (
        <div className="w-[350px] border-l border-border bg-background flex flex-col h-full absolute right-0 top-0 bottom-0 z-20 shadow-xl transition-transform duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                <h2 className="font-semibold text-lg">Group Info</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <ScrollArea className="flex-1">
                {/* Group Details Header */}
                <div className="p-6 flex flex-col items-center border-b border-border bg-card">
                    <div className="relative mb-4 group">
                        <Avatar className="w-28 h-28 border-4 border-background shadow-sm">
                            <AvatarImage 
                                src={conversation.icon || PROFILE_DEFAULT_URL} 
                                className="object-cover"
                            />
                            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                                {conversation.name?.[0]?.toUpperCase() || "G"}
                            </AvatarFallback>
                        </Avatar>
                        {isAdmin && (
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" onClick={() => toast.info("Icon upload coming soon")}>
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>

                    {isEditMode ? (
                        <div className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-1.5">
                                <Label htmlFor="gname" className="text-xs font-semibold text-muted-foreground uppercase">Group Subject</Label>
                                <Input id="gname" value={groupName} onChange={e => setGroupName(e.target.value)} className="font-medium" placeholder="Group Name" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="gdesc" className="text-xs font-semibold text-muted-foreground uppercase">Description</Label>
                                <Input id="gdesc" value={groupDesc} onChange={e => setGroupDesc(e.target.value)} className="text-sm" placeholder="Add a description" />
                            </div>
                            <div className="flex gap-2 justify-end pt-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsEditMode(false)}>Cancel</Button>
                                <Button size="sm" onClick={handleUpdateInfo} disabled={updateInfoMutation.isPending}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center w-full space-y-2">
                            <div className="flex items-center justify-center gap-2 group/edit">
                                <h3 className="text-xl font-bold text-foreground break-words">{conversation.name}</h3>
                                {isAdmin && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/edit:opacity-100 transition-opacity" onClick={() => setIsEditMode(true)}>
                                        <PenLine className="w-3.5 h-3.5 text-muted-foreground" />
                                    </Button>
                                )}
                            </div>
                            {conversation.description && (
                                <p className="text-sm text-muted-foreground px-4 text-center leading-relaxed">
                                    {conversation.description}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground pt-1">
                                Group · {conversation.participants.length} participants
                            </p>
                        </div>
                    )}
                </div>

                {/* Participants Section */}
                <div className="p-0">
                     <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border">
                        <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {conversation.participants.length} Participants
                        </h4>
                        {isAdmin && (
                            <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary hover:text-primary hover:bg-primary/10" onClick={() => setIsAddMemberOpen(true)}>
                                <UserPlus className="w-4 h-4" /> Add
                            </Button>
                        )}
                    </div>

                    <div className="divide-y divide-border">
                        {conversation.participants.map(participant => {
                            const isMe = participant.userId === currentUserId;
                            const isPartAdmin = participant.role === 'ADMIN' || conversation.ownerId === participant.userId;
                            const isPartOwner = conversation.ownerId === participant.userId;
                            
                            return (
                                <div key={participant.userId} className="flex items-center justify-between p-3 px-4 hover:bg-muted/30 group transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <Avatar className="w-10 h-10 border border-border">
                                            <AvatarImage src={participant.profilePhoto || PROFILE_DEFAULT_URL} />
                                            <AvatarFallback>{participant.name?.[0]?.toUpperCase() || participant.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate flex items-center gap-1.5">
                                                {isMe ? "You" : participant.name}
                                                {isPartOwner && (
                                                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">Owner</span>
                                                )}
                                                {isPartAdmin && !isPartOwner && (
                                                    <span className="text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">Admin</span>
                                                )}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                                @{participant.username}
                                            </span>
                                        </div>
                                    </div>

                                    {isAdmin && !isMe && !isPartOwner && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100">
                                                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                {isPartAdmin ? (
                                                    <DropdownMenuItem onClick={() => demoteMutation.mutate(participant.userId)}>
                                                        <ShieldOff className="w-4 h-4 mr-2" /> Dismiss as Admin
                                                    </DropdownMenuItem>
                                                ) : (
                                                            <DropdownMenuItem onClick={() => promoteMutation.mutate(participant.userId)}>
                                                        <Shield className="w-4 h-4 mr-2" /> Make Group Admin
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem 
                                                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                    onClick={() => removeParticipantMutation.mutate(participant.userId)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Remove from Group
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <Separator className="my-2" />

                <div className="p-4 space-y-3">
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start pl-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLeaveGroup}
                    >
                        <LogOut className="w-4 h-4 mr-3" /> Exit Group
                    </Button>

                    {isOwner && (
                         <Button 
                            variant="ghost" 
                            className="w-full justify-start pl-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleDeleteGroup}
                        >
                            <Trash2 className="w-4 h-4 mr-3" /> Delete Group
                        </Button>
                    )}
                </div>
            </ScrollArea>

            {/* Add Participants Dialog */}
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Participants</DialogTitle>
                        <DialogDescription>
                            Select users to add to the group.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search users..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <ScrollArea className="h-[250px] border rounded-md p-2">
                        {filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                                <Users className="w-8 h-8 opacity-50" />
                                <p className="text-sm">No users found</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {filteredUsers.map((user: any) => {
                                    const isSelected = selectedUsers.includes(user.id);
                                    return (
                                        <div 
                                            key={user.id} 
                                            className={cn(
                                                "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                                                isSelected && "bg-muted"
                                            )}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                } else {
                                                    setSelectedUsers([...selectedUsers, user.id]);
                                                }
                                            }}
                                        >
                                            <Avatar className="w-9 h-9">
                                                <AvatarImage src={user.profilePhoto || PROFILE_DEFAULT_URL} />
                                                <AvatarFallback>{user.name?.[0] || user.username?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center animate-in zoom-in-50 duration-200">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddParticipants} disabled={selectedUsers.length === 0 || addParticipantsMutation.isPending}>
                            Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ""}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
