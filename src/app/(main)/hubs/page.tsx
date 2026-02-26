"use client";

import React, { useState } from "react";
import { Search, Hash, Users, Loader2, ArrowRight, Plus, Sparkles, Globe, Lock, Zap } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
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

// Pastel color palette for topic tags (cycles through deterministically by topic string)
const TOPIC_COLORS = [
    "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200",
    "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200",
    "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200",
    "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200",
    "bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200",
    "bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200",
    "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200",
    "bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200",
    "bg-lime-100 text-lime-700 border-lime-200 hover:bg-lime-200",
];

// Active (selected) variants for each color
const TOPIC_COLORS_ACTIVE = [
    "bg-violet-600 text-white border-violet-700",
    "bg-sky-600 text-white border-sky-700",
    "bg-emerald-600 text-white border-emerald-700",
    "bg-amber-500 text-white border-amber-600",
    "bg-rose-600 text-white border-rose-700",
    "bg-indigo-600 text-white border-indigo-700",
    "bg-teal-600 text-white border-teal-700",
    "bg-orange-500 text-white border-orange-600",
    "bg-pink-600 text-white border-pink-700",
    "bg-lime-600 text-white border-lime-700",
];

function getTopicColorIndex(topic: string): number {
    let hash = 0;
    for (let i = 0; i < topic.length; i++) {
        hash = (hash * 31 + topic.charCodeAt(i)) % TOPIC_COLORS.length;
    }
    return hash;
}

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="container max-w-6xl mx-auto py-10 px-4 space-y-8">

                {/* Header */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                Hubs
                            </h1>
                            <p className="text-sm text-slate-500">Discover communities, join discussions, and connect with peers.</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6 h-11 bg-slate-100/80 border border-slate-200/60 p-1 rounded-xl max-w-[320px]">
                        <TabsTrigger
                            value="discover"
                            className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm font-medium text-slate-500 transition-all"
                        >
                            <Globe className="w-4 h-4 mr-2" />
                            Discover
                        </TabsTrigger>
                        <TabsTrigger
                            value="my-hubs"
                            className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm font-medium text-slate-500 transition-all"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            My Hubs
                        </TabsTrigger>
                    </TabsList>

                    {/* Search & Filter bar */}
                    <div className="space-y-4 mb-8">
                        <div className="relative max-w-xl">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search hubs by name or description..."
                                className="pl-10 h-11 bg-white border-slate-200 rounded-xl shadow-sm focus-visible:ring-violet-400 focus-visible:border-violet-300 placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {activeTab === "discover" && topics.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {/* "All" pill */}
                                <button
                                    onClick={() => setSelectedTopic(null)}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                                        selectedTopic === null
                                            ? "bg-slate-800 text-white border-slate-900 shadow-sm"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    <Zap className="w-3 h-3" />
                                    All
                                </button>
                                {topics.map(topic => {
                                    const idx = getTopicColorIndex(topic);
                                    const isActive = selectedTopic === topic;
                                    return (
                                        <button
                                            key={topic}
                                            onClick={() => setSelectedTopic(topic === selectedTopic ? null : topic)}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                                                isActive
                                                    ? TOPIC_COLORS_ACTIVE[idx]
                                                    : `${TOPIC_COLORS[idx]} border`
                                            }`}
                                        >
                                            <Hash className="w-3 h-3" />
                                            {topic}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Discover Tab */}
                    <TabsContent value="discover" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        {isDiscoverLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                                </div>
                                <p className="text-sm text-slate-400">Loading hubs...</p>
                            </div>
                        ) : discoverGroups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <Search className="w-7 h-7 text-slate-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-700 font-semibold text-lg">No public hubs found</p>
                                    <p className="text-sm text-slate-400 max-w-xs">We couldn't find any hubs matching your current search or topic filters.</p>
                                </div>
                                <button
                                    onClick={() => { setSearchQuery(""); setSelectedTopic(null); }}
                                    className="mt-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {discoverGroups.map(group => (
                                    <GroupCard key={group.conversationId} group={group} currentUser={user} />
                                ))}
                            </div>
                        )}

                        {/* Infinite Scroll trigger */}
                        {activeTab === "discover" && hasNextPage && (
                            <div ref={ref} className="flex justify-center py-8">
                                {isFetchingNextPage && (
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Loading more...
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* My Hubs Tab */}
                    <TabsContent value="my-hubs" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                        {isMyGroupsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
                                </div>
                                <p className="text-sm text-slate-400">Loading your hubs...</p>
                            </div>
                        ) : myGroups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                    <Users className="w-7 h-7 text-violet-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-700 font-semibold text-lg">No joined hubs</p>
                                    <p className="text-sm text-slate-400 max-w-xs">
                                        {searchQuery
                                            ? "No joined hubs match your search."
                                            : "You haven't joined any hubs yet. Discover new communities in the Discover tab!"}
                                    </p>
                                </div>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {myGroups.map(group => (
                                    <GroupCard key={group.conversationId} group={group} currentUser={user} />
                                ))}
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

    const isMember = group.isMember;
    const isRequestPending = group.isRequestPending;

    const { mutate: joinGroup, isPending } = useJoinGroup(group.conversationId);

    const handleJoin = () => {
        if (!currentUser) return toast.error("Please login to join groups");
        if (!headers.Authorization) return toast.error("Authentication required. Please refresh the page.");
        joinGroup(currentUser.id);
    };

    const handleView = () => {
        router.push(`/chat?id=${group.conversationId}`);
    };

    // Pick a gradient for the avatar fallback based on group name
    const gradients = [
        "from-violet-400 to-indigo-500",
        "from-sky-400 to-blue-500",
        "from-emerald-400 to-teal-500",
        "from-amber-400 to-orange-500",
        "from-rose-400 to-pink-500",
    ];
    const gradientIdx = group.name ? group.name.charCodeAt(0) % gradients.length : 0;
    const avatarGradient = gradients[gradientIdx];

    return (
        <div className="group relative flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
            {/* Subtle top accent line that reflects group color */}
            <div className={`h-1 w-full bg-gradient-to-r ${avatarGradient} opacity-60`} />

            {/* Card body */}
            <div className="flex flex-col flex-1 p-5 gap-4">
                {/* Header: avatar + name + member count */}
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                        <Avatar className="w-12 h-12 rounded-xl ring-2 ring-white shadow-sm">
                            <AvatarImage src={group.icon || PROFILE_DEFAULT_URL} alt={group.name || "Group"} className="object-cover" />
                            <AvatarFallback className={`rounded-xl bg-gradient-to-br ${avatarGradient} text-white font-bold text-lg`}>
                                {group.name?.charAt(0)?.toUpperCase() || "G"}
                            </AvatarFallback>
                        </Avatar>
                        {/* Online indicator dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate leading-tight text-base" title={group.name || "Group"}>
                            {group.name || "Unnamed Group"}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-xs text-slate-500 font-medium">
                                {group.memberCount} member{group.memberCount !== 1 && "s"}
                            </span>
                        </div>
                    </div>

                    {/* Member badge */}
                    {isMember && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-semibold uppercase tracking-wide">
                            Joined
                        </span>
                    )}
                    {isRequestPending && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-semibold uppercase tracking-wide">
                            Pending
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed flex-1">
                    {group.description || (
                        <span className="italic text-slate-400">No description provided.</span>
                    )}
                </p>

                {/* Topics */}
                {group.topics && group.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {group.topics.slice(0, 4).map((topic: string) => {
                            const idx = getTopicColorIndex(topic);
                            return (
                                <span
                                    key={topic}
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${TOPIC_COLORS[idx]}`}
                                >
                                    <Hash className="w-2.5 h-2.5" />
                                    {topic}
                                </span>
                            );
                        })}
                        {group.topics.length > 4 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                +{group.topics.length - 4} more
                            </span>
                        )}
                    </div>
                )}

                {/* Action button */}
                <div className="mt-auto pt-2">
                    {isMember ? (
                        <button
                            onClick={handleView}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors shadow-sm"
                        >
                            Open Hub
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : isRequestPending ? (
                        <button
                            disabled
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 text-sm font-semibold cursor-not-allowed"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Request Sent
                        </button>
                    ) : (
                        <button
                            onClick={handleJoin}
                            disabled={isPending || !headers.Authorization}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm
                                ${isPending || !headers.Authorization
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                                    : `bg-gradient-to-r ${avatarGradient} text-white hover:opacity-90 hover:shadow-md`
                                }`}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending request...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Request to Join
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
