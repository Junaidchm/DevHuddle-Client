"use client";

import React, { useState } from "react";
import { Search, Hash, Users, Loader2, ArrowRight, Plus } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { useDiscoverGroups } from "@/src/hooks/chat/useDiscoverGroups";
import { useMyGroups } from "@/src/hooks/chat/useMyGroups";
import { useGroupTopics } from "@/src/hooks/chat/useGroupTopics";
import { useJoinGroup } from "@/src/hooks/chat/useGroupMutations";
import { useSession } from "next-auth/react";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useDebounce from "@/src/customHooks/useDebounce";
import { GroupListDto } from "@/src/types/chat.types";
import { useInView } from "react-intersection-observer";

export default function HubsPage() {
    const { data: session } = useSession();
    const user = session?.user;
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("discover");
    const { ref, inView } = useInView();

    const debouncedQuery = useDebounce(searchQuery, 300);

    // Queries
    const { data: topicsData } = useGroupTopics(15);
    const topics = topicsData?.map(t => t.topic) || [];

    const { 
        data: discoverData, 
        isLoading: isDiscoverLoading, 
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage
    } = useDiscoverGroups({
        query: debouncedQuery,
        topics: selectedTopic ? [selectedTopic] : undefined,
        limit: 20
    });

    const { data: myGroupsData, isLoading: isMyGroupsLoading } = useMyGroups({
        query: debouncedQuery,
    });

    // Infinite scroll trigger
    React.useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, fetchNextPage, hasNextPage]);

    const discoverGroups = discoverData?.pages.flat() || [];
    const myGroups = myGroupsData || [];

    return (
        <div className="container max-w-6xl mx-auto py-8 space-y-8">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hubs</h1>
                    <p className="text-muted-foreground mt-1">Discover communities, join discussions, and connect with peers.</p>
                </div>
                {/* Future: Create Hub Button. Hide for now or redirect to chat modal */}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="discover">Discover</TabsTrigger>
                    <TabsTrigger value="my-hubs">My Hubs</TabsTrigger>
                </TabsList>

                {/* Search and Filters */}
                <div className="space-y-4 mb-8">
                    <div className="relative max-w-xl">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search hubs by name or description..." 
                            className="pl-9 h-11 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    {activeTab === "discover" && topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <Button 
                                variant={selectedTopic === null ? "default" : "outline"} 
                                size="sm" 
                                onClick={() => setSelectedTopic(null)}
                                className="rounded-full"
                            >
                                All
                            </Button>
                            {topics.map(topic => (
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
                    )}
                </div>

                <TabsContent value="discover" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    {isDiscoverLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : discoverGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-sm space-y-4">
                            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                                <Search className="w-8 h-8 text-primary/30" />
                            </div>
                            <div className="max-w-xs space-y-1">
                                <p className="text-foreground font-semibold">No public hubs found</p>
                                <p className="text-sm text-muted-foreground text-balance">We couldn't find any hubs matching your current search or topic filters.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedTopic(null); }} className="rounded-full">
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {discoverGroups.map(group => (
                                <GroupCard key={group.conversationId} group={group} currentUser={user} />
                            ))}
                        </div>
                    )}
                    
                    {/* Infinite Scroll trigger */}
                    {activeTab === "discover" && hasNextPage && (
                        <div ref={ref} className="flex justify-center py-8">
                            {isFetchingNextPage && <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="my-hubs" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    {isMyGroupsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : myGroups.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-sm space-y-4">
                            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                                <Users className="w-8 h-8 text-primary/30" />
                            </div>
                            <div className="max-w-xs space-y-1">
                                <p className="text-foreground font-semibold">No joined hubs</p>
                                <p className="text-sm text-muted-foreground text-balance">
                                    {searchQuery ? "No joined hubs match your search." : "You haven't joined any hubs yet. Discover new communities in the Discover tab!"}
                                </p>
                            </div>
                            {searchQuery && (
                                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="rounded-full">
                                    Clear search
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myGroups.map(group => (
                                <GroupCard key={group.conversationId} group={group} currentUser={user} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function GroupCard({ group, currentUser }: { group: GroupListDto, currentUser: { id: string } | null | undefined }) {
    const router = useRouter();
    const headers = useAuthHeaders(); 
    
    // isMember is provided by the backend now!
    const isMember = group.isMember;
    
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
                    <AvatarImage src={group.icon || PROFILE_DEFAULT_URL} alt={group.name || "Group"} />
                    <AvatarFallback className="rounded-lg">{group.name?.charAt(0) || "G"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-bold truncate leading-tight mb-1.5" title={group.name || "Group"}>
                        {group.name || "Unnamed Group"}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-none font-medium gap-1.5 px-2.5 py-0.5 pointer-events-none">
                        <Users className="w-3.5 h-3.5" />
                        {group.memberCount} member{group.memberCount !== 1 && 's'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                    {group.description || "No description provided."}
                </p>
                {group.topics && group.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                        {group.topics.slice(0, 3).map((topic: string) => (
                            <Badge key={topic} variant="secondary" className="text-xs px-2 py-0.5 font-medium">
                                #{topic}
                            </Badge>
                        ))}
                         {group.topics.length > 3 && (
                            <span className="text-[10px] h-5 flex items-center px-1 text-muted-foreground">+{group.topics.length - 3}</span>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0">
                {isMember ? (
                    <Button variant="secondary" className="w-full gap-2 border border-border" onClick={handleView}>
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
