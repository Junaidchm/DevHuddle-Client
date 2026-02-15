"use client";

import React, { useState } from "react";
import { Search, Hash, Users, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { useAllGroups } from "@/src/hooks/chat/useAllGroups";
import { useJoinGroup } from "@/src/hooks/chat/useGroupMutations";
import { useSession } from "next-auth/react";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useDebounce from "@/src/customHooks/useDebounce";

const POPULAR_TOPICS = ["React", "Next.js", "TypeScript", "Design", "Career", "Open Source", "AI", "DevOps"];

export default function HubsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    
    // Debounce search query to avoid too many requests
    const debouncedQuery = useDebounce(searchQuery, 300);

    const { data: groups, isLoading, error } = useAllGroups({
        query: debouncedQuery,
        topics: selectedTopic ? [selectedTopic] : undefined,
        limit: 50 // Fetch more initially
    });

    const joinGroupMutation = useJoinGroup(""); // Group ID will be passed dynamically? No, hook takes ID. 
    // Wait, useJoinGroup hook takes groupId in its creation? 
    // Let's check useGroupMutations.ts
    // export const useJoinGroup = (groupId: string) => { ... }
    // This is not ideal for a list where we join different groups. 
    // I should modify useJoinGroup to take groupId in mutate function or use a specific hook for the card.
    // For now, I will create a sub-component for the Group Card to handle the hook properly.

    return (
        <div className="container max-w-6xl mx-auto py-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Explore Hubs</h1>
                    <p className="text-muted-foreground mt-1">Discover communities, join discussions, and connect with peers.</p>
                </div>
                {/* <Button onClick={() => openCreateGroupModal()}>Create Hub</Button> Should probably be here too? */}
            </div>

            {/* Search and Filter Section */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search hubs by name, description, or topic..." 
                        className="pl-9 h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant={selectedTopic === null ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setSelectedTopic(null)}
                        className="rounded-full"
                    >
                        All
                    </Button>
                    {POPULAR_TOPICS.map(topic => (
                        <Button
                            key={topic}
                            variant={selectedTopic === topic ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTopic(topic === selectedTopic ? null : topic)}
                            className="rounded-full"
                        >
                            <Hash className="w-3 h-3 mr-1" />
                            {topic}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : error ? (
                <div className="text-center py-12 text-destructive">
                    Failed to load hubs. Please try again.
                </div>
            ) : groups?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No hubs found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups?.map(group => (
                        <GroupCard key={group.conversationId} group={group} currentUser={user} />
                    ))}
                </div>
            )}
        </div>
    );
}

function GroupCard({ group, currentUser }: { group: any, currentUser: any }) {
    const router = useRouter();
    const headers = useAuthHeaders(); // Get auth headers
    const isMember = group.participantIds?.includes(currentUser?.id);
    
    // We need a specific mutation instance for this group
    const { mutate: joinGroup, isPending } = useJoinGroup(group.conversationId);

    const handleJoin = () => {
        if (!currentUser) return toast.error("Please login to join groups");
        if (!headers.Authorization) return toast.error("Authentication required. Please refresh the page.");
        
        joinGroup(currentUser.id, {
            onSuccess: () => {
                toast.success("Joined group successfully");
                router.push(`/chat?id=${group.conversationId}`);
            }
        });
    };

    const handleView = () => {
        router.push(`/chat?id=${group.conversationId}`);
    };

    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                <Avatar className="w-12 h-12 rounded-lg">
                    <AvatarImage src={group.icon || PROFILE_DEFAULT_URL} alt={group.name} />
                    <AvatarFallback className="rounded-lg">{group.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate leading-tight mb-1">
                        {group.name}
                    </CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        {group.participantIds?.length || 0} members
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                    {group.description || "No description provided."}
                </p>
                {group.topics && group.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {group.topics.slice(0, 3).map((topic: string) => (
                            <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                #{topic}
                            </Badge>
                        ))}
                         {group.topics.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{group.topics.length - 3}</span>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0">
                {isMember ? (
                    <Button variant="secondary" className="w-full gap-2" onClick={handleView}>
                        View Hub
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button 
                        className="w-full" 
                        onClick={handleJoin} 
                        disabled={isPending || !headers.Authorization}
                    >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Join Hub
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
