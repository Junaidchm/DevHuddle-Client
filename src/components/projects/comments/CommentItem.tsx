"use client";

import { useState } from "react";
import { ProjectComment } from "@/src/services/api/project.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { getMediaUrl } from "@/src/utils/media";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreHorizontal, Reply, Trash2, Edit2 } from "lucide-react";
import CommentInput from "./CommentInput";
import { useDeleteProjectComment, useProjectReplies } from "@/src/customHooks/useProjectComments";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/src/components/ui/dropdown-menu";
import useGetUserData from "@/src/customHooks/useGetUserData";
import { confirmToast } from "@/src/utils/confirmToast";
import { cn } from "@/src/lib/utils";

interface CommentItemProps {
  comment: ProjectComment;
  projectId: string;
  isReply?: boolean;
}

export default function CommentItem({ comment, projectId, isReply = false }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  
  const user = useGetUserData();
  const deleteMutation = useDeleteProjectComment();
  
  // Use 'user' first, then 'author' as fallback (backend returns 'user')
  const author = comment.user || comment.author;
  const isOwner = user?.id === comment.userId;

  const { data: replies } = useProjectReplies(comment.id);

  const handleDelete = () => {
    confirmToast("Are you sure you want to delete this comment?", () => {
        deleteMutation.mutate({ 
            commentId: comment.id, 
            projectId, 
            parentCommentId: comment.parentCommentId 
        });
    });
  };

  if (isEditing) {
    return (
      <div className={cn("py-4", isReply ? "ml-12" : "")}>
        <CommentInput
          projectId={projectId}
          commentId={comment.id}
          initialValue={comment.content}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className={cn("group py-4 transition-colors", isReply ? "ml-12 border-l border-border/50 pl-6" : "border-b border-border/50 last:border-0")}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 border border-border">
          <AvatarImage src={getMediaUrl(author?.avatar) || PROFILE_DEFAULT_URL} alt={author?.name} />
          <AvatarFallback>{author?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{author?.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.editedAt && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded italic">edited</span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner ? (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="gap-2">
                      <Edit2 className="w-4 h-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="gap-2 text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="gap-2">
                    <Flag className="w-4 h-4" /> Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {comment.content}
          </div>
          
          <div className="flex items-center gap-4 pt-1">
            {!isReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs gap-1.5 text-muted-foreground hover:text-primary"
                onClick={() => setIsReplying(!isReplying)}
              >
                <Reply className="w-3.5 h-3.5" />
                Reply
              </Button>
            )}
            
            {comment.replies && comment.replies.length > 0 && !showReplies && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs gap-1.5 text-primary hover:underline"
                onClick={() => setShowReplies(true)}
              >
                View {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="mt-4 ml-11">
          <CommentInput
            projectId={projectId}
            parentCommentId={comment.id}
            placeholder={`Reply to ${author?.name}...`}
            onSuccess={() => {
              setIsReplying(false);
              setShowReplies(true);
            }}
            onCancel={() => setIsReplying(false)}
            autoFocus
          />
        </div>
      )}

      {showReplies && replies && (
        <div className="mt-2">
          {replies.map((reply) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              projectId={projectId} 
              isReply 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Re-using Flag icon from lucide
import { Flag } from "lucide-react";
