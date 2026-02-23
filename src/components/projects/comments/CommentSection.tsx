"use client";

import { useProjectComments } from "@/src/customHooks/useProjectComments";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { MessageSquare, MessageCircle } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";

interface CommentSectionProps {
  projectId: string;
}

export default function CommentSection({ projectId }: CommentSectionProps) {
  const { data: comments, isLoading, error } = useProjectComments(projectId);

  if (error) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
        {error instanceof Error ? error.message : "Failed to load comments"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">
          Comments {comments ? `(${comments.length})` : ""}
        </h2>
      </div>

      <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
        <CommentInput projectId={projectId} />
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="divide-y divide-border/50">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                projectId={projectId} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <div className="p-4 bg-muted rounded-full mb-4">
              <MessageCircle className="w-8 h-8 opacity-20" />
            </div>
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
