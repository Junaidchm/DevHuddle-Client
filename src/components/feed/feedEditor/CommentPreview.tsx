"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useCommentPreviewQuery } from "../queries/useCommentsQeury";
import { Comment } from "@/src/app/types/feed";
import { formatRelativeDate } from "@/src/utils/formateRelativeDate";
import { Loader2, Heart, MessageCircle } from "lucide-react";
import { useCommentLikeMutation } from "../mutations/useCommentLikeMutation";
import CommentSection from "./CommentSection";

import { PROFILE_DEFAULT_URL } from "@/src/constents";

// Author Badge Component
const AuthorBadge: React.FC = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 ml-1">
    Author
  </span>
);

interface CommentPreviewProps {
  postId: string;
  postAuthorId?: string;
  onLoadMore: () => void;
}

export const CommentPreview: React.FC<CommentPreviewProps> = ({
  postId,
  postAuthorId,
  onLoadMore,
}) => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";
  const { data, isLoading } = useCommentPreviewQuery(postId);
  const likeMutation = useCommentLikeMutation();

  if (isLoading) {
    return (
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data?.data?.comment) {
    return null;
  }

  const { comment, hasMore } = data.data;

  return (
    <div className="border-t border-gray-100 pt-3">
      {/* Preview Comment */}
      <div className="px-4 pb-3">
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
              <button className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Load more comments button */}
      {hasMore && (
        <div className="px-4 pb-3">
          <button
            onClick={onLoadMore}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Load more comments
          </button>
        </div>
      )}
    </div>
  );
};
