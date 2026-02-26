"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import {
  useProjectComments,
  useCreateProjectComment,
  useUpdateProjectComment,
  useDeleteProjectComment,
  useProjectCommentLikeMutation,
} from "@/src/customHooks/useProjectComments";

interface CommentSectionProps {
  projectId: string;
  projectAuthorId?: string;
}

// ─── Author Badge ──────────────────────────────────────────────────────────
const AuthorBadge: React.FC = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 ml-1">
    Author
  </span>
);

// ─── Comment Input ─────────────────────────────────────────────────────────
const CommentInput: React.FC<{
  projectId: string;
  parentCommentId?: string;
  commentId?: string;
  initialValue?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({
  projectId,
  parentCommentId,
  commentId,
  initialValue = "",
  placeholder = "Add a comment...",
  onSuccess,
  onCancel,
}) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createMutation = useCreateProjectComment();
  const updateMutation = useUpdateProjectComment();
  const isUpdate = !!commentId;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (isUpdate) {
        await updateMutation.mutateAsync({ commentId: commentId!, content: content.trim() });
      } else {
        await createMutation.mutateAsync({ projectId, content: content.trim(), parentCommentId });
      }
      setContent("");
      onSuccess?.();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (_) {
      // handled by mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === "Escape") onCancel?.();
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          rows={1}
          disabled={isSubmitting}
        />
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : isUpdate ? "Save" : "Post"}
        </button>
      </div>
    </form>
  );
};

// ─── Comment Menu ─────────────────────────────────────────────────────────
const CommentMenu: React.FC<{
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onClose: () => void;
}> = ({ isOwner, onEdit, onDelete, onReport, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
    >
      {isOwner ? (
        <>
          <button
            onClick={() => { onEdit(); onClose(); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => { onDelete(); onClose(); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </>
      ) : (
        <button
          onClick={() => { onReport(); onClose(); }}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <Flag className="w-4 h-4" /> Report
        </button>
      )}
    </div>
  );
};

// ─── Reply Item ──────────────────────────────────────────────────────────
const ReplyItem: React.FC<{
  reply: ProjectComment;
  currentUserId: string;
  projectId: string;
  projectAuthorId?: string;
  mainCommentId: string;
  mainCommentAuthorName?: string;
}> = ({ reply, currentUserId, projectId, projectAuthorId, mainCommentId, mainCommentAuthorName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const deleteMutation = useDeleteProjectComment();
  const likeMutation = useProjectCommentLikeMutation();

  const author = reply.user || reply.author;
  const isOwner = reply.userId === currentUserId;

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    deleteMutation.mutate({ commentId: reply.id, projectId, parentCommentId: mainCommentId });
  };

  if (isEditing) {
    return (
      <div className="ml-8 mt-2">
        <CommentInput
          projectId={projectId}
          commentId={reply.id}
          initialValue={reply.content}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="ml-8 mt-3 flex gap-2 transition-all duration-500 rounded-lg p-1">
      <img
        src={getMediaUrl(author?.avatar) || PROFILE_DEFAULT_URL}
        alt={author?.name || "User"}
        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">{author?.name || "Unknown User"}</span>
            {projectAuthorId && reply.userId === projectAuthorId && <AuthorBadge />}
            <span className="text-xs text-gray-500">
              {formatRelativeDate(new Date(reply.createdAt))}
              {reply.editedAt && " • Edited"}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{reply.content}</p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2">
          <button
            onClick={() => {
              if (likeMutation.isPending) return;
              likeMutation.mutate({ commentId: reply.id, projectId, isLiked: reply.isLiked || false, parentCommentId: mainCommentId });
            }}
            disabled={likeMutation.isPending}
            className={`text-xs font-medium flex items-center gap-1 ${
              reply.isLiked ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
            } ${likeMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart className={`w-3 h-3 ${reply.isLiked ? "fill-current" : ""}`} />
            {(reply.likesCount || 0) > 0 && reply.likesCount}
            <span>Like</span>
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" /> Reply
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-xs text-gray-600 hover:text-gray-800">
              <MoreVertical className="w-3 h-3" />
            </button>
            {showMenu && (
              <CommentMenu
                isOwner={isOwner}
                onEdit={() => setIsEditing(true)}
                onDelete={handleDelete}
                onReport={() => {}}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>
        </div>
        {showReplyInput && (
          <div className="mt-3 ml-8">
            <CommentInput
              projectId={projectId}
              parentCommentId={mainCommentId}
              placeholder={`Reply to ${mainCommentAuthorName || "comment"}...`}
              onSuccess={() => setShowReplyInput(false)}
              onCancel={() => setShowReplyInput(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Comment Item ─────────────────────────────────────────────────────────
const CommentItem: React.FC<{
  comment: ProjectComment;
  currentUserId: string;
  projectId: string;
  projectAuthorId?: string;
}> = ({ comment, currentUserId, projectId, projectAuthorId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const deleteMutation = useDeleteProjectComment();
  const likeMutation = useProjectCommentLikeMutation();

  const author = comment.user || comment.author;
  const isOwner = comment.userId === currentUserId;
  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;
  const visibleReplies = showReplies ? replies : replies.slice(0, 2);

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    deleteMutation.mutate({ commentId: comment.id, projectId });
  };

  if (isEditing) {
    return (
      <div className="py-3">
        <CommentInput
          projectId={projectId}
          commentId={comment.id}
          initialValue={comment.content}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0 transition-all duration-500 rounded-lg px-2">
      <div className="flex gap-3">
        <img
          src={getMediaUrl(author?.avatar) || PROFILE_DEFAULT_URL}
          alt={author?.name || "User"}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">{author?.name || "Unknown User"}</span>
              {projectAuthorId && comment.userId === projectAuthorId && <AuthorBadge />}
              <span className="text-xs text-gray-500">
                {formatRelativeDate(new Date(comment.createdAt))}
                {comment.editedAt && " • Edited"}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{comment.content}</p>
          </div>

          <div className="flex items-center gap-4 ml-2">
            <button
              onClick={() => {
                if (likeMutation.isPending) return;
                likeMutation.mutate({ commentId: comment.id, projectId, isLiked: comment.isLiked || false });
              }}
              disabled={likeMutation.isPending}
              className={`text-xs font-medium flex items-center gap-1 ${
                comment.isLiked ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              } ${likeMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Heart className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`} />
              {(comment.likesCount || 0) > 0 && comment.likesCount}
              <span>Like</span>
            </button>
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" /> Reply
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-xs text-gray-600 hover:text-gray-800">
                <MoreVertical className="w-3 h-3" />
              </button>
              {showMenu && (
                <CommentMenu
                  isOwner={isOwner}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDelete}
                  onReport={() => {}}
                  onClose={() => setShowMenu(false)}
                />
              )}
            </div>
          </div>

          {/* Replies - LinkedIn-style flat structure */}
          {hasReplies && (
            <div className="mt-2">
              {visibleReplies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  projectId={projectId}
                  projectAuthorId={projectAuthorId}
                  mainCommentId={comment.id}
                  mainCommentAuthorName={author?.name}
                />
              ))}
              {replies.length > 2 && !showReplies && (
                <button
                  onClick={() => setShowReplies(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  View {replies.length - 2} more {replies.length - 2 === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          )}

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3 ml-8">
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

// ─── Main CommentSection ──────────────────────────────────────────────────
export default function CommentSection({ projectId, projectAuthorId }: CommentSectionProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";
  const [showCommentInput, setShowCommentInput] = useState(false);

  const { data: comments, isLoading, refetch } = useProjectComments(projectId);

  // Force fresh data on mount
  useEffect(() => {
    if (projectId) refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const allComments = comments || [];

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Comment Input */}
      <div className="p-4 border-b border-gray-100">
        {!showCommentInput ? (
          <button
            onClick={() => setShowCommentInput(true)}
            className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-500 text-sm transition-colors"
          >
            Add a comment...
          </button>
        ) : (
          <CommentInput
            projectId={projectId}
            placeholder="Add a comment..."
            onSuccess={() => setShowCommentInput(false)}
            onCancel={() => setShowCommentInput(false)}
          />
        )}
      </div>

      {/* Comments List */}
      <div className="max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : allComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="p-4">
            {allComments.map((comment) => (
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
