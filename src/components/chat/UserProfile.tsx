"use client";

import React from "react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { X, Mail, Calendar, User as UserIcon } from "lucide-react";
import { Separator } from "@/src/components/ui/separator";

interface UserProfileProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
    onClose: () => void;
}

export function UserProfile({ conversation, currentUserId, onClose }: UserProfileProps) {
    const participant = conversation.participants.find(p => p.userId !== currentUserId);

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
                <div className="p-8 flex flex-col items-center border-b border-border bg-card">
                    <Avatar className="w-32 h-32 border-4 border-background shadow-lg mb-4">
                        <AvatarImage 
                            src={participant.profilePhoto || PROFILE_DEFAULT_URL} 
                            className="object-cover"
                        />
                        <AvatarFallback className="text-4xl bg-muted text-muted-foreground">
                            {participant.name?.[0]?.toUpperCase() || participant.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="text-2xl font-bold text-foreground text-center break-words w-full px-4">
                        {participant.name}
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium mt-1">@{participant.username}</p>
                </div>

                {/* Details Section */}
                <div className="p-6 space-y-6">
                    {/* About / Bio Placeholder (If we had it) */}
                    {/* 
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">About</h4>
                        <p className="text-sm leading-relaxed">Hey there! I am using this chat app.</p>
                    </div> 
                    */}

                    {/* Email (If available in a real app, usually hidden for privacy unless added) we don't have email in participant type yet 
                       But let's assume we might show something else or just username/id
                    */}
                    
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 text-sm">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="font-medium text-foreground">Joined Chat</p>
                                <p className="text-muted-foreground text-xs">Member since {new Date().getFullYear()}</p> 
                                {/* We don't have 'joinedAt' for the user globally, only 'createdAt' for participant relation */}
                            </div>
                        </div>
                    </div>
                </div>

                <Separator />
                
                {/* Common Groups (Placeholder for future) */}
                {/* <div className="p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">1 Group in common</h4>
                    ...
                </div> */}
            </ScrollArea>
        </div>
    );
}
