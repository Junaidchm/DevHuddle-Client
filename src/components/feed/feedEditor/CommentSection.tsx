"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCommentsInfiniteQuery } from "../queries/useCommentsQeury";
import {
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../mutations/useCommentMutation";
import { useCommentLikeMutation } from "../mutations/useCommentLikeMutation";
import { Comment } from "@/src/app/types/feed";
import { formatRelativeDate } from "@/src/utils/formateRelativeDate";
import {
  Loader2,
  MoreVertical,
  Edit2,
  Trash2,
  Heart,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface CommentSectionProps {
  postId: string;
  postAuthorId?: string; // For showing Author badge
  onClose?: () => void;
}

const PROFILE_DEFAULT_URL = "/default-avatar.png";

// Author Badge Component (LinkedIn-style)
const AuthorBadge: React.FC = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 ml-1">
    Author
  </span>
);

// Comment Input Component
const CommentInput: React.FC<{
  postId: string;
  parentCommentId?: string;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}> = ({
  postId,
  parentCommentId,
  placeholder = "Add a comment...",
  onSuccess,
  onCancel,
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createMutation = useCreateCommentMutation();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        postId,
        content: content.trim(),
        parentCommentId,
      });
      setContent("");
      onSuccess?.();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      // Error is handled by mutation
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
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
        </button>
      </div>
    </form>
  );
};

// View Replies Button Component
const ViewRepliesButton: React.FC<{
  commentId: string;
  replyCount: number;
  onLoadReplies: () => void;
  isLoading: boolean;
}> = ({ commentId, replyCount, onLoadReplies, isLoading }) => {
  if (replyCount === 0) return null;

  return (
    <button
      onClick={onLoadReplies}
      disabled={isLoading}
      className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 disabled:opacity-50"
    >
      {isLoading ? (
        <span className="flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Loading...
        </span>
      ) : (
        `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
      )}
    </button>
  );
};

// Comment Menu Component
const CommentMenu: React.FC<{
  comment: Comment;
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
      className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
    >
      <button
        onClick={() => {
          onEdit();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

// Reply Item Component
const ReplyItem: React.FC<{
  reply: Comment;
  currentUserId: string;
  postId: string;
  postAuthorId?: string;
  mainCommentId: string; // LinkedIn-style: Always reply to main comment
  mainCommentAuthorName?: string; // For showing "Reply to [Name]..."
}> = ({
  reply,
  currentUserId,
  postId,
  postAuthorId,
  mainCommentId,
  mainCommentAuthorName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const updateMutation = useUpdateCommentMutation();
  const deleteMutation = useDeleteCommentMutation();
  const likeMutation = useCommentLikeMutation();

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updateMutation.mutateAsync({
        commentId: reply.id,
        content: editContent.trim(),
        postId,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await deleteMutation.mutateAsync({
        commentId: reply.id,
        postId,
      });
    } catch (error) {
      // Error handled by mutation
    }
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
          <button
            onClick={handleEdit}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditContent(reply.content);
            }}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-8 mt-3 flex gap-2">
      <img
        src={
          reply.user?.avatar
            ? `${process.env.NEXT_PUBLIC_IMAGE_PATH}${reply.user.avatar}`
            : PROFILE_DEFAULT_URL
        }
        alt={reply.user?.name || "User"}
        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {reply.user?.name || "Unknown User"}
            </span>
            {postAuthorId && reply.userId === postAuthorId && <AuthorBadge />}
            <span className="text-xs text-gray-500">
              {formatRelativeDate(new Date(reply.createdAt))}
              {reply.editedAt && " • Edited"}
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
            {reply.content}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2">
          <button
            onClick={() => {
              if (likeMutation.isPending) return;
              likeMutation.mutate({
                commentId: reply.id,
                isLiked: reply.isLiked || false,
                postId,
              });
            }}
            disabled={likeMutation.isPending}
            className={`text-xs font-medium flex items-center gap-1 ${
              reply.isLiked
                ? "text-blue-600 fill-blue-600"
                : "text-gray-600 hover:text-blue-600"
            } ${likeMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Heart
              className={`w-3 h-3 ${reply.isLiked ? "fill-current" : ""}`}
            />
            {reply.likesCount > 0 && reply.likesCount}
            <span>Like</span>
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            Reply
          </button>
          {reply.userId === currentUserId && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
              {showMenu && (
                <CommentMenu
                  comment={reply}
                  currentUserId={currentUserId}
                  onEdit={() => setIsEditing(true)}
                  onDelete={handleDelete}
                  onClose={() => setShowMenu(false)}
                />
              )}
            </div>
          )}
        </div>

        {/* Reply Input - LinkedIn-style: Always reply to main comment */}
        {showReplyInput && (
          <div className="mt-3 ml-8">
            <CommentInput
              postId={postId}
              parentCommentId={mainCommentId}
              placeholder={`Reply to ${mainCommentAuthorName || "comment"}...`}
              onSuccess={() => {
                setShowReplyInput(false);
                // The query will automatically refetch and show the new reply
              }}
              onCancel={() => setShowReplyInput(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Comment Item Component
const CommentItem: React.FC<{
  comment: Comment;
  currentUserId: string;
  postId: string;
  postAuthorId?: string;
}> = ({ comment, currentUserId, postId, postAuthorId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const updateMutation = useUpdateCommentMutation();
  const deleteMutation = useDeleteCommentMutation();
  const likeMutation = useCommentLikeMutation();

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updateMutation.mutateAsync({
        commentId: comment.id,
        content: editContent.trim(),
        postId,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteMutation.mutateAsync({
        commentId: comment.id,
        postId,
      });
    } catch (error) {
      // Error handled by mutation
    }
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
          <button
            onClick={handleEdit}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditContent(comment.content);
            }}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex gap-3">
        <img
          src={
            comment.user?.avatar
              ? `${process.env.NEXT_PUBLIC_IMAGE_PATH}${comment.user.avatar}`
              : PROFILE_DEFAULT_URL
          }
          alt={comment.user?.name || "User"}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">
                {comment.user?.name || "Unknown User"}
              </span>
              {postAuthorId && comment.userId === postAuthorId && (
                <AuthorBadge />
              )}
              <span className="text-xs text-gray-500">
                {formatRelativeDate(new Date(comment.createdAt))}
                {comment.editedAt && " • Edited"}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          </div>

          <div className="flex items-center gap-4 ml-2">
            <button
              onClick={() => {
                if (likeMutation.isPending) return;
                likeMutation.mutate({
                  commentId: comment.id,
                  isLiked: comment.isLiked || false,
                  postId,
                });
              }}
              disabled={likeMutation.isPending}
              className={`text-xs font-medium flex items-center gap-1 ${
                comment.isLiked
                  ? "text-blue-600 fill-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              } ${
                likeMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Heart
                className={`w-3 h-3 ${comment.isLiked ? "fill-current" : ""}`}
              />
              {comment.likesCount > 0 && comment.likesCount}
              <span>Like</span>
            </button>
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
            >
              <MessageCircle className="w-3 h-3" />
              Reply
            </button>
            {comment.userId === currentUserId && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="text-xs text-gray-600 hover:text-gray-800"
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
            )}
          </div>

          {/* Replies - LinkedIn-style: Flat structure, no nesting */}
          {hasReplies && (
            <div className="mt-2">
              {visibleReplies.map((reply) => (
                <ReplyItem
                  key={reply.id}
                  reply={reply}
                  currentUserId={currentUserId}
                  postId={postId}
                  postAuthorId={postAuthorId}
                  mainCommentId={comment.id}
                  mainCommentAuthorName={comment.user?.name}
                />
              ))}
              {replies.length > 2 && !showReplies && (
                <ViewRepliesButton
                  commentId={comment.id}
                  replyCount={replies.length - 2}
                  onLoadReplies={() => setShowReplies(true)}
                  isLoading={false}
                />
              )}
            </div>
          )}

          {/* Reply Input */}
          {showReplyInput && (
            <div className="mt-3 ml-8">
              <CommentInput
                postId={postId}
                parentCommentId={comment.id}
                placeholder={`Reply to ${comment.user?.name || "comment"}...`}
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

// Main CommentSection Component
export default function CommentSection({
  postId,
  postAuthorId,
  onClose,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";
  const [showCommentInput, setShowCommentInput] = useState(false);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useCommentsInfiniteQuery(postId);

  // Always refetch when component mounts to ensure fresh data
  // This fixes the issue where cached data might be stale or incomplete
  // The preview query might have cached only 1 comment, so we need fresh data
  useEffect(() => {
    if (postId) {
      // Force refetch to get fresh data from backend
      // This ensures we get all comments, not just cached preview data
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]); // Refetch when postId changes

  const allComments = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Comment Input Section */}
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
            postId={postId}
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
                postId={postId}
                postAuthorId={postAuthorId}
              />
            ))}
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {isFetchingNextPage ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more comments...
                  </span>
                ) : (
                  "Load more comments"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
