"use client";

import React, { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSharedMedia } from "@/src/services/api/chat.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { useInView } from "react-intersection-observer";

interface MediaSectionProps {
    conversationId: string;
    currentUserId: string;
}

export function MediaSection({ conversationId }: MediaSectionProps) {
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
        queryKey: ['shared-media', conversationId],
        queryFn: ({ pageParam = 0 }) => 
            getSharedMedia(conversationId, 'IMAGE,VIDEO', authHeaders), // Backend handles offset? Actually backend query had offset
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
                <p>Failed to load media</p>
            </div>
        );
    }

    const allMedia = data?.pages.flat() || [];

    if (allMedia.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                <ImageIcon className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium">No media shared yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
                Shared Media ({allMedia.length})
            </h4>
            
            <div className="grid grid-cols-3 gap-2">
                {allMedia.map((message: any) => (
                    <div 
                        key={message.id} 
                        className="aspect-square rounded-lg overflow-hidden bg-muted group relative cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    >
                        <img 
                            src={message.mediaUrl} 
                            alt="Shared"
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            loading="lazy"
                        />
                        {message.type === 'VIDEO' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Loading Trigger */}
            <div ref={ref} className="h-10 flex justify-center items-center">
                {isFetchingNextPage && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </div>
        </div>
    );
}
