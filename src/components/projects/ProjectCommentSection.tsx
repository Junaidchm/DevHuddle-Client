"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  useProjectCommentsQuery,
  useProjectCommentMutations,
  useProjectRepliesQuery,
} from "./hooks/useProjectComments";
import { ProjectComment } from "@/src/services/api/project.service";
import { formatRelativeDate } from "@/src/utils/formateRelativeDate";
import { getMediaUrl } from "@/src/utils/media";
import {
  Loader2,
  MoreVertical,
  Edit2,
  Trash2,
  Heart,
  MessageCircle,
  Flag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { confirmToast } from "@/src/utils/confirmToast";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

interface ProjectCommentSectionProps {
  projectId: string;
  projectAuthorId?: string;
  onClose?: () => void;
}

const AuthorBadge: React.FC = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 ml-1">
    Author
  </span>
);

const CommentInput: React.FC<{
  projectId: string;
  parentCommentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({
  projectId,
  parentCommentId,
  placeholder = "Add a comment...",
  onSuccess,
  onCancel,
}) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { createComment } = useProjectCommentMutations(projectId);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || createComment.isPending) return;

    try {
      await createComment.mutateAsync({
        content: content.trim(),
        parentCommentId,
      });
      setContent("");
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === "Escape") {
      onCancel?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-background"
          rows={1}
          disabled={createComment.isPending}
        />
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            disabled={createComment.isPending}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || createComment.isPending}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
        </button>
      </div>
    </form>
  );
};

const CommentMenu: React.FC<{
  comment: ProjectComment;
  currentUserId: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}> = ({ comment, currentUserId, onEdit, onDelete, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const isOwner = comment.userId === currentUserId;
  
  if (!isOwner) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-6 bg-popover border border-border rounded-lg shadow-lg z-10 min-w-[120px] py-1"
    >
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-accent flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

const CommentItem: React.FC<{
  comment: ProjectComment;
  currentUserId: string;
  projectId: string;
  projectAuthorId?: string;
}> = ({ comment, currentUserId, projectId, projectAuthorId }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  
  const { updateComment, deleteComment } = useProjectCommentMutations(projectId);
  const author = comment.author || (comment as any).user;

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updateComment.mutateAsync({
        commentId: comment.id,
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {}
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment.mutateAsync(comment.id);
    } catch (error) {}
  };

  const replies = comment.replies || [];

  if (isEditing) {
    return (
      <div className="py-3">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-background"
          rows={3}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditContent(comment.content);
            }}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/80"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-border/50 last:border-b-0">
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={getMediaUrl(author?.avatar) || PROFILE_DEFAULT_URL} />
          <AvatarFallback>{author?.name?.charAt(0) || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/30 rounded-lg px-3 py-2 mb-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-foreground">
                {author?.name || "Unknown User"}
              </span>
              {projectAuthorId && comment.userId === projectAuthorId && <AuthorBadge />}
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(new Date(comment.createdAt))}
                {comment.editedAt && " • Edited"}
              </span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-2">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-muted-foreground hover:text-primary font-medium flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              Reply
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
              {showMenu && (
                <CommentMenu
                  comment={comment}
                  currentUserId={currentUserId}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDelete}
                  onClose={() => setShowMenu(false)}
                />
              )}
            </div>
          </div>

          {/* Replies Section */}
          {replies.length > 0 && (
            <div className="mt-2 ml-4 border-l-2 border-border/50 pl-4 space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                   <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarImage src={getMediaUrl((reply.author || (reply as any).user)?.avatar) || PROFILE_DEFAULT_URL} />
                    <AvatarFallback>{(reply.author || (reply as any).user)?.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-xs text-foreground">
                          {(reply.author || (reply as any).user)?.name || "Unknown User"}
                        </span>
                        {projectAuthorId && reply.userId === projectAuthorId && <AuthorBadge />}
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelativeDate(new Date(reply.createdAt))}
                        </span>
                      </div>
                      <p className="text-xs text-foreground whitespace-pre-wrap break-words">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showReplyInput && (
            <div className="mt-3 ml-4">
              <CommentInput
                projectId={projectId}
                parentCommentId={comment.id}
                placeholder={`Reply to ${author?.name || "comment"}...`}
                onSuccess={() => setShowReplyInput(false)}
                onCancel={() => setShowReplyInput(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProjectCommentSection({
  projectId,
  projectAuthorId,
}: ProjectCommentSectionProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";
  const [showCommentInput, setShowCommentInput] = useState(false);

  const { data: comments, isLoading } = useProjectCommentsQuery(projectId);

  return (
    <div className="border-t border-border mt-6">
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            Comments 
            <span className="text-sm font-normal text-muted-foreground">({comments?.length || 0})</span>
        </h3>

        {!showCommentInput ? (
          <button
            onClick={() => setShowCommentInput(true)}
            className="w-full text-left px-4 py-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border text-muted-foreground text-sm transition-all"
          >
            Share your thoughts on this project...
          </button>
        ) : (
          <CommentInput
            projectId={projectId}
            onSuccess={() => setShowCommentInput(false)}
            onCancel={() => setShowCommentInput(false)}
          />
        )}
      </div>

      <div className="px-4 pb-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !comments || comments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No comments yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                projectId={projectId}
                projectAuthorId={projectAuthorId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
