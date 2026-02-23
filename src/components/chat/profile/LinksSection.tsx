"use client";

import React, { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getConversationLinks } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { Loader2, ExternalLink, Link as LinkIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface LinksSectionProps {
    conversationId: string;
    currentUserId: string;
}

export function LinksSection({ conversationId }: LinksSectionProps) {
    const authHeaders = useAuthHeaders();
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteQuery({
        queryKey: ['conversation-links', conversationId],
        queryFn: ({ pageParam = 0 }) => 
            getConversationLinks(conversationId, authHeaders, 20, pageParam as number),
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 20) return undefined;
            return allPages.length * 20;
        },
        initialPageParam: 0,
        enabled: !!conversationId && !!authHeaders.Authorization
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center py-10 text-destructive">
                <p>Failed to load links</p>
            </div>
        );
    }

    const allLinks = data?.pages.flat() || [];

    if (allLinks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                <LinkIcon className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium">No links shared yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                Shared Links ({allLinks.length})
            </h4>
            
            <div className="space-y-3">
                {allLinks.map((link: any) => (
                    <a 
                        key={link.id} 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <LinkIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                                {link.title || link.url}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {link.url}
                            </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                ))}
            </div>

            {/* Loading Trigger */}
            <div ref={ref} className="h-10 flex justify-center items-center">
                {isFetchingNextPage && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </div>
        </div>
    );
}
