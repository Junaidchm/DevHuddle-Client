"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  useProjectCommentsInfiniteQuery, 
  useProjectCommentRepliesQuery 
} from "../queries/useProjectCommentsQuery";
import {
  useCreateProjectCommentMutation,
  useUpdateProjectCommentMutation,
  useDeleteProjectCommentMutation,
} from "../mutations/useProjectCommentMutation";
import { useProjectCommentLikeOptimisticMutation } from "../mutations/useProjectCommentLikeMutation";
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
import ReportProjectModal from "../modals/ReportProjectModal";
import { PROFILE_DEFAULT_URL } from "@/src/constants";

interface CommentSectionProps {
  projectId: string;
  projectAuthorId?: string;
}

// Author Badge Component
const AuthorBadge: React.FC = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 ml-1">
    Author
  </span>
);

// Comment Input Component
const CommentInput: React.FC<{
  projectId: string;
  parentCommentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}> = ({
  projectId,
  parentCommentId,
  placeholder = "Add a comment...",
  onSuccess,
  onCancel,
  autoFocus = false,
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createMutation = useCreateProjectCommentMutation();

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        projectId,
        content: content.trim(),
        parentCommentId,
      });
      setContent("");
      onSuccess?.();
    } catch (error) {
      // Handled by mutation
    } finally {
      setIsSubmitting(false);
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
        </button>
      </div>
    </form>
  );
};

// Comment Menu Component
const CommentMenu: React.FC<{
  comment: ProjectComment;
  currentUserId: string;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  onClose: () => void;
}> = ({ comment, currentUserId, onEdit, onDelete, onReport, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = comment.userId === currentUserId;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
    >
      {isOwner ? (
        <>
          <button
            onClick={onEdit}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </>
      ) : (
        <button
          onClick={onReport}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
        >
          <Flag className="w-4 h-4" /> Report
        </button>
      )}
    </div>
  );
};

// Reply Item Component
const ReplyItem: React.FC<{
  reply: ProjectComment;
  currentUserId: string;
  projectId: string;
  projectAuthorId?: string;
  mainCommentId: string;
  mainCommentAuthorName?: string;
  onReport: (id: string) => void;
}> = ({
  reply,
  currentUserId,
  projectId,
  projectAuthorId,
  mainCommentId,
  mainCommentAuthorName,
  onReport,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  
  const updateMutation = useUpdateProjectCommentMutation();
  const deleteMutation = useDeleteProjectCommentMutation();
  const likeMutation = useProjectCommentLikeOptimisticMutation(projectId);

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updateMutation.mutateAsync({
        commentId: reply.id,
        content: editContent.trim(),
        projectId,
      });
      setIsEditing(false);
    } catch (error) {}
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await deleteMutation.mutateAsync({
        commentId: reply.id,
        projectId,
      });
    } catch (error) {}
  };

  if (isEditing) {
    return (
      <div className="ml-8 mt-2">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={2}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button onClick={handleEdit} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
          <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-8 mt-3 flex gap-2">
      <img
        src={getMediaUrl(reply.user?.avatar) || PROFILE_DEFAULT_URL}
        alt={reply.user?.name}
        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">{reply.user?.name}</span>
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
            onClick={() => likeMutation.mutate({ commentId: reply.id, isLiked: reply.isLiked || false })}
            className={`text-xs font-medium flex items-center gap-1 ${reply.isLiked ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
          >
            <Heart className={`w-3 h-3 ${reply.isLiked ? "fill-current" : ""}`} />
            {reply.likesCount > 0 && reply.likesCount}
            <span>Like</span>
          </button>
          <button onClick={() => setShowReplyInput(!showReplyInput)} className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> Reply
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="text-xs text-gray-600 hover:text-gray-800">
              <MoreVertical className="w-3 h-3" />
            </button>
            {showMenu && (
              <CommentMenu
                comment={reply}
                currentUserId={currentUserId}
                onEdit={() => setIsEditing(true)}
                onDelete={handleDelete}
                onReport={() => onReport(reply.id)}
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
              placeholder={`Reply to ${mainCommentAuthorName}...`}
              onSuccess={() => setShowReplyInput(false)}
              onCancel={() => setShowReplyInput(false)}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Comment Item Component
const CommentItem: React.FC<{
  comment: ProjectComment;
  currentUserId: string;
  projectId: string;
  projectAuthorId?: string;
  onReport: (id: string) => void;
}> = ({ comment, currentUserId, projectId, projectAuthorId, onReport }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const updateMutation = useUpdateProjectCommentMutation();
  const deleteMutation = useDeleteProjectCommentMutation();
  const likeMutation = useProjectCommentLikeOptimisticMutation(projectId);

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updateMutation.mutateAsync({
        commentId: comment.id,
        content: editContent.trim(),
        projectId,
      });
      setIsEditing(false);
    } catch (error) {}
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteMutation.mutateAsync({
        commentId: comment.id,
        projectId,
      });
    } catch (error) {}
  };

  const replies = comment.replies || [];
  const hasReplies = replies.length > 0;
  const visibleReplies = showReplies ? replies : replies.slice(0, 2);

  if (isEditing) {
    return (
      <div className="py-3">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows={3}
          autoFocus
        />
        <div className="flex gap-2 mt-2">
          <button onClick={handleEdit} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Save</button>
          <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0 px-2">
      <div className="flex gap-3">
        <img
          src={getMediaUrl(comment.user?.avatar) || PROFILE_DEFAULT_URL}
          alt={comment.user?.name}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">{comment.user?.name}</span>
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
              onClick={() => likeMutation.mutate({ commentId: comment.id, isLiked: comment.isLiked || false })}
              className={`text-xs font-medium flex items-center gap-1 ${comment.isLiked ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
            >
              <Heart className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`} />
              {comment.likesCount > 0 && comment.likesCount}
              <span>Like</span>
            </button>
            <button onClick={() => setShowReplyInput(!showReplyInput)} className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> Reply
            </button>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-xs text-gray-600 hover:text-gray-800">
                <MoreVertical className="w-3 h-3" />
              </button>
              {showMenu && (
                <CommentMenu
                  comment={comment}
                  currentUserId={currentUserId}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDelete}
                  onReport={() => onReport(comment.id)}
                  onClose={() => setShowMenu(false)}
                />
              )}
            </div>
          </div>
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
                  mainCommentAuthorName={comment.user?.name}
                  onReport={onReport}
                />
              ))}
              {replies.length > 2 && !showReplies && (
                <button onClick={() => setShowReplies(true)} className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2">
                  View {replies.length - 2} more {replies.length - 2 === 1 ? "reply" : "replies"}
                </button>
              )}
            </div>
          )}
          {showReplyInput && (
            <div className="mt-3 ml-8">
              <CommentInput
                projectId={projectId}
                parentCommentId={comment.id}
                placeholder={`Reply to ${comment.user?.name}...`}
                onSuccess={() => setShowReplyInput(false)}
                onCancel={() => setShowReplyInput(false)}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CommentSection({
  projectId,
  projectAuthorId,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useProjectCommentsInfiniteQuery(projectId);

  const allComments = data?.pages.flatMap((page: any) => page.data) || [];

  return (
    <div className="border-t border-gray-200 bg-white rounded-b-xl overflow-hidden">
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
            autoFocus
          />
        )}
      </div>

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
            {allComments.map((comment: ProjectComment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                projectId={projectId}
                projectAuthorId={projectAuthorId}
                onReport={(id) => setReportingCommentId(id)}
              />
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading more..." : "Load more comments"}
              </button>
            )}
          </div>
        )}
      </div>

      {reportingCommentId && (
        <ReportProjectModal
          isOpen={!!reportingCommentId}
          onClose={() => setReportingCommentId(null)}
          targetId={reportingCommentId}
          targetType="COMMENT"
        />
      )}
    </div>
  );
}
