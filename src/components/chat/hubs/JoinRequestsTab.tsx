import React from "react";
import { useHubRequests, useApproveHubRequest, useRejectHubRequest } from "@/src/hooks/chat/useHubRequests";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Check, X, Loader2, UserPlus } from "lucide-react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface JoinRequestsTabProps {
    hubId: string;
}

export function JoinRequestsTab({ hubId }: JoinRequestsTabProps) {
    const { data: requests = [], isLoading } = useHubRequests(hubId);
    const approveMutation = useApproveHubRequest(hubId);
    const rejectMutation = useRejectHubRequest(hubId);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                <p className="text-sm">Loading requests...</p>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <UserPlus className="w-6 h-6 opacity-50" />
                </div>
                <h4 className="font-medium text-foreground">No pending requests</h4>
                <p className="text-sm max-w-[200px] mt-1">
                    When people request to join this hub, they'll show up here.
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[350px]">
            <div className="space-y-4 pr-4">
                {requests.map((request: any) => (
                    <div 
                        key={request.id} 
                        className="flex items-center justify-between p-3 rounded-xl border bg-card hover:shadow-sm transition-shadow"
                    >
                        <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border">
                                <AvatarImage src={request.requester?.profilePhoto || PROFILE_DEFAULT_URL} />
                                <AvatarFallback>{request.requester?.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">
                                    {request.requester?.name || "Unknown User"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    @{request.requester?.username || "unknown"} • {formatDistanceToNow(new Date(request.requestedAt))} ago
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => rejectMutation.mutate(request.id)}
                                disabled={rejectMutation.isPending || approveMutation.isPending}
                            >
                                {rejectMutation.isPending && rejectMutation.variables === request.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <X className="w-4 h-4" />
                                )}
                            </Button>
                            <Button 
                                size="sm" 
                                className="h-8 gap-1.5 px-3 rounded-full bg-primary hover:bg-primary/90 shadow-sm"
                                onClick={() => approveMutation.mutate(request.id)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                            >
                                {approveMutation.isPending && approveMutation.variables === request.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Approve</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}
