"use client";

import React, { useState } from "react";
import { ConversationWithMetadata } from "@/src/types/chat.types";
import { Info, Image, Link, Users, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { InfoSection } from "./profile/InfoSection";
import { MediaSection } from "./profile/MediaSection";
import { LinksSection } from "./profile/LinksSection";
import { GroupsSection } from "./profile/GroupsSection";

interface ProfilePanelProps {
    conversation: ConversationWithMetadata;
    currentUserId: string;
    onClose: () => void;
    onConversationDeleted?: () => void;
}

type TabType = 'info' | 'media' | 'links' | 'groups';

export function ProfilePanel({ conversation, currentUserId, onClose, onConversationDeleted }: ProfilePanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const isGroup = conversation.type === 'GROUP';
    const participant = !isGroup ? conversation.participants.find(p => p.userId !== currentUserId) : null;

    const tabs = [
        { id: 'info', icon: Info, label: 'Overview' },
        { id: 'media', icon: Image, label: 'Media' },
        { id: 'links', icon: Link, label: 'Links' },
        { id: 'groups', icon: Users, label: isGroup ? 'Members' : 'Groups in Common' },
    ] as const;

    const renderContent = () => {
        switch (activeTab) {
            case 'info':
                return <InfoSection conversation={conversation} currentUserId={currentUserId} minimal={true} onConversationDeleted={onConversationDeleted} />;
            case 'media':
                return <MediaSection conversationId={conversation.conversationId} currentUserId={currentUserId} />;
            case 'links':
                return <LinksSection conversationId={conversation.conversationId} currentUserId={currentUserId} />;
            case 'groups':
                return <GroupsSection conversation={conversation} currentUserId={currentUserId} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-background border-l shadow-xl">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b bg-card">
                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/10 shadow-sm shrink-0">
                        <AvatarImage src={isGroup ? conversation.icon || undefined : participant?.profilePhoto || undefined} />
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">
                            {isGroup ? (conversation.name?.[0] || 'G') : (participant?.username?.[0] || '?')}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col min-w-0">
                        <h2 className="text-lg font-bold tracking-tight truncate">
                            {isGroup ? conversation.name : (participant?.name || participant?.username || 'Unknown User')}
                        </h2>
                        <div className="flex items-center gap-2 text-muted-foreground overflow-hidden">
                            {!isGroup && participant?.username && (
                                <span className="text-xs font-medium truncate">@{participant.username}</span>
                            )}
                            {(isGroup || participant?.isOnline) && (
                                <Badge variant="secondary" className="h-4 px-1 text-[9px] tracking-wide uppercase shrink-0">
                                    {isGroup ? 'Group' : 'Online'}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Horizontal Tabs Navigation */}
            <div className="flex items-center px-2 py-1 bg-muted/30 border-b overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold transition-all duration-200 shrink-0 whitespace-nowrap",
                            activeTab === tab.id 
                                ? "text-primary border-b-2 border-primary rounded-none" 
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <tab.icon className={cn(
                            "w-3.5 h-3.5",
                            activeTab === tab.id ? "stroke-[2.5px]" : "stroke-2"
                        )} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <ScrollArea className="flex-1">
                <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {renderContent()}
                </div>
            </ScrollArea>
        </div>
    );
}
