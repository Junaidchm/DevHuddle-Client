"use client";

import React, { useState } from "react";
import { Search, Hash, Users, Loader2, ArrowRight, Plus } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { cn } from "@/src/lib/utils";
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
import Pagination from "@/src/components/profile/Pagination";

export default function HubsPage() {
    const { data: session } = useSession();
    const user = session?.user;
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("discover");
    const [page, setPage] = useState(1);
    const limit = 12;

    const debouncedQuery = useDebounce(searchQuery, 300);

    // Queries
    const { data: topicsData } = useGroupTopics(15);
    const topics = topicsData?.map(t => t.topic) || [];

    const { 
        data: discoverData, 
        isLoading: isDiscoverLoading, 
    } = useDiscoverGroups({
        query: debouncedQuery,
        topics: selectedTopic ? [selectedTopic] : undefined,
        limit,
        page
    });

    const { data: myGroupsData, isLoading: isMyGroupsLoading } = useMyGroups({
        query: debouncedQuery,
        limit,
        page
    });

    // Reset page when tab or filters change
    React.useEffect(() => {
        setPage(1);
    }, [activeTab, debouncedQuery, selectedTopic]);

    const discoverGroups = discoverData?.data.groups || [];
    const myGroups = myGroupsData?.data.groups || [];
    
    const totalCount = activeTab === "discover" 
        ? (discoverData?.data.totalCount || 0) 
        : (myGroupsData?.data.totalCount || 0);
    
    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-[#f8fafc]">
            {/* Vibrant Background Accents */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse delay-700" />
            </div>

            <div className="container max-w-6xl mx-auto py-12 px-4 relative z-10 space-y-12">
                {/* Header Section */}
                <div className="space-y-4 text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Hubs
                    </h1>
                    <p className="text-lg text-muted-foreground font-medium">
                        Discover communities, join discussions, and connect with peers around the world.
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col items-center gap-8 mb-12">
                        <TabsList className="p-1 bg-muted/50 backdrop-blur-md border border-border/50 rounded-2xl h-14 w-full max-w-[420px] grid grid-cols-2">
                            <TabsTrigger 
                                value="discover" 
                                className="rounded-xl font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Discover
                            </TabsTrigger>
                            <TabsTrigger 
                                value="my-hubs"
                                className="rounded-xl font-bold text-sm data-[state=active]:bg-background data-[state=active]:shadow-lg data-[state=active]:text-primary transition-all duration-300"
                            >
                                <Users className="w-4 h-4 mr-2" />
                                My Hubs
                            </TabsTrigger>
                        </TabsList>

                        {/* Search and Filters Bar */}
                        <div className="w-full space-y-6">
                            <div className="relative max-w-3xl mx-auto group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        placeholder="Search hubs by name, description or topics..." 
                                        className="pl-12 h-14 bg-background/80 border-border/50 backdrop-blur-xl rounded-2xl text-base shadow-sm group-focus-within:ring-2 group-focus-within:ring-primary/20 group-focus-within:border-primary transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            {activeTab === "discover" && topics.length > 0 && (
                                <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
                                    <Button 
                                        variant={selectedTopic === null ? "default" : "secondary"} 
                                        size="sm" 
                                        onClick={() => setSelectedTopic(null)}
                                        className={cn(
                                            "rounded-full px-5 font-bold transition-all duration-300",
                                            selectedTopic === null ? "shadow-md scale-105" : "bg-muted/50 hover:bg-muted"
                                        )}
                                    >
                                        All Topics
                                    </Button>
                                    {topics.map(topic => (
                                        <Button
                                            key={topic}
                                            variant={selectedTopic === topic ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => setSelectedTopic(topic === selectedTopic ? null : topic)}
                                            className={cn(
                                                "rounded-full px-5 font-bold transition-all duration-300",
                                                selectedTopic === topic ? "shadow-md scale-105" : "bg-muted/50 hover:bg-muted"
                                            )}
                                        >
                                            <Hash className="w-3 h-3 mr-1.5 opacity-60" />
                                            {topic}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <TabsContent value="discover" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        {isDiscoverLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-[280px] rounded-3xl bg-muted/20 animate-pulse border border-border/50" />
                                ))}
                            </div>
                        ) : discoverGroups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/50 backdrop-blur-xl rounded-[40px] border border-white shadow-2xl space-y-6 max-w-lg mx-auto">
                                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-bounce">
                                    <Search className="w-10 h-10 text-primary/40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-foreground">No public hubs found</h3>
                                    <p className="text-muted-foreground text-balanced max-w-[280px]">
                                        We couldn't find any hubs matching your current filter. Try a different search!
                                    </p>
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={() => { setSearchQuery(""); setSelectedTopic(null); }} 
                                    className="rounded-2xl px-8 font-bold border-2"
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                                {discoverGroups.map(group => (
                                    <GroupCard key={group.conversationId} group={group} currentUser={user} />
                                ))}
                            </div>
                        )}
                        
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination 
                                    currentPage={page} 
                                    totalPages={totalPages} 
                                    onPageChange={setPage} 
                                    isLoading={isDiscoverLoading}
                                />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="my-hubs" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        {isMyGroupsLoading ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-[280px] rounded-3xl bg-muted/20 animate-pulse border border-border/50" />
                                ))}
                            </div>
                        ) : myGroups.length === 0 ? (
                             <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/50 backdrop-blur-xl rounded-[40px] border border-white shadow-2xl space-y-6 max-w-lg mx-auto">
                                <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
                                    <Users className="w-10 h-10 text-blue-500/40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-foreground">No joined hubs</h3>
                                    <p className="text-muted-foreground text-balanced max-w-[280px]">
                                        {searchQuery ? "No joined hubs match your search." : "You haven't joined any hubs yet. Discover new communities in the Discover tab!"}
                                    </p>
                                </div>
                                {searchQuery && (
                                    <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-2xl px-8 font-bold border-2">
                                        Clear search
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                                {myGroups.map(group => (
                                    <GroupCard key={group.conversationId} group={group} currentUser={user} />
                                ))}
                            </div>
                        )}
                        {totalPages > 1 && (
                            <div className="mt-8">
                                <Pagination 
                                    currentPage={page} 
                                    totalPages={totalPages} 
                                    onPageChange={setPage} 
                                    isLoading={isMyGroupsLoading}
                                />
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function GroupCard({ group, currentUser }: { group: GroupListDto, currentUser: { id: string } | null | undefined }) {
    const router = useRouter();
    const headers = useAuthHeaders(); 
    
    // isMember and isRequestPending are provided by the backend now!
    const isMember = group.isMember;
    const isRequestPending = group.isRequestPending;
    
    // We need a specific mutation instance for this group
    const { mutate: joinGroup, isPending } = useJoinGroup(group.conversationId);

    const handleJoin = () => {
        if (!currentUser) return toast.error("Please login to join groups");
        if (!headers.Authorization) return toast.error("Authentication required. Please refresh the page.");
        
        joinGroup(currentUser.id);
    };

    const handleView = () => {
        router.push(`/chat?id=${group.conversationId}`);
    };

    return (
        <Card className="group flex flex-col h-full bg-white/70 backdrop-blur-xl border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-[32px] overflow-hidden hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="relative flex flex-row items-center gap-5 space-y-0 p-6 pb-4">
                <div className="relative">
                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/30 to-blue-400/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Avatar className="w-16 h-16 rounded-2xl border-2 border-white shadow-sm transition-transform duration-500 group-hover:scale-105 relative z-10">
                        <AvatarImage src={group.icon || PROFILE_DEFAULT_URL} alt={group.name || "Group"} className="object-cover" />
                        <AvatarFallback className="rounded-2xl bg-muted text-xl font-bold">{group.name?.charAt(0) || "G"}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                    <CardTitle className="text-xl font-extrabold truncate leading-tight tracking-tight group-hover:text-primary transition-colors duration-300" title={group.name || "Group"}>
                        {group.name || "Unnamed Hub"}
                    </CardTitle>
                    <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2">
                             {[1,2,3].map(i => (
                                 <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-muted flex items-center justify-center overflow-hidden">
                                     <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                                 </div>
                             ))}
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">
                            {group.memberCount} members
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative flex-1 p-6 pt-2 pb-6">
                <p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-2 min-h-[2.5em]">
                    {group.description || "No description provided. Join to explore the community."}
                </p>
                {group.topics && group.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-5">
                        {group.topics.slice(0, 3).map((topic: string) => (
                            <Badge key={topic} variant="secondary" className="bg-muted/40 hover:bg-muted font-bold text-[10px] px-3 py-1 rounded-full border-none tracking-wide">
                                #{topic.toLowerCase()}
                            </Badge>
                        ))}
                         {group.topics.length > 3 && (
                            <Badge variant="outline" className="text-[10px] font-bold h-6 px-2.5 rounded-full border-muted/50 text-muted-foreground">
                                +{group.topics.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="relative p-6 pt-0 mt-auto">
                <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-border/40 to-transparent" />
                <div className="w-full pt-4">
                    {isMember ? (
                        <Button 
                            className="w-full h-12 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-bold gap-2 group/btn transition-all duration-300 shadow-xl shadow-foreground/10" 
                            onClick={handleView}
                        >
                            View Hub
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : isRequestPending ? (
                        <Button 
                            variant="secondary" 
                            className="w-full h-12 rounded-2xl font-bold bg-muted/60 text-muted-foreground cursor-default" 
                            disabled
                        >
                            Request Sent
                        </Button>
                    ) : (
                        <Button 
                            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold group/btn shadow-xl shadow-primary/20 transition-all duration-300" 
                            onClick={handleJoin} 
                            disabled={isPending || !headers.Authorization}
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                            )}
                            Join Hub
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
