"use client";

import { Comment, Edit, Like, Share } from "@/src/constents/svg";
import React, { useState, useMemo } from "react";
import { NewPost, PostEngagement } from "@/src/app/types/feed";
// import { CommentSection } from "./CommentSection";
// import { ShareDialog } from "./ShareDialog";
// import { ReportDialog } from "./ReportDialog";
import { useLikeMutation } from "../mutations/useLikeMutation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/lib/queryKeys";
import { InfiniteData } from "@tanstack/react-query";
import { PostsPage } from "@/src/app/types/feed";

// SocialActionButton component
interface SocialActionButtonProps {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  disabled?: boolean;
}

export const SocialActionButton: React.FC<SocialActionButtonProps> = ({
  icon,
  count,
  onClick,
  className = "",
  isActive = false,
  disabled = false,
}) => (
  <button
    className={`bg-transparent border-none flex items-center gap-1.5 text-sm cursor-pointer px-2 py-1 rounded transition-all duration-200 ease-in-out hover:bg-gray-100 ${
      isActive
        ? "text-blue-600 fill-blue-600"
        : "text-gray-600 hover:text-blue-600"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    onClick={onClick}
    disabled={disabled}
    aria-label={`${count || 0} ${isActive ? "liked" : "likes"}`}
  >
    {icon}
    {count !== undefined && (
      <span className="font-medium">{count > 0 ? count : ""}</span>
    )}
  </button>
);

// SocialIconButton component
interface SocialIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export const SocialIconButton: React.FC<SocialIconButtonProps> = ({
  icon,
  onClick,
  className = "",
  isActive = false,
}) => (
  <button
    className={`bg-transparent border-none p-1.5 cursor-pointer transition-all duration-200 ease-in-out rounded hover:bg-gray-100 ${
      isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
    } ${className}`}
    onClick={onClick}
    aria-label="Share post"
  >
    {icon}
  </button>
);

interface PostIntractProps {
  post: NewPost;
  className?: string;
}

export const PostIntract: React.FC<PostIntractProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const likeMutation = useLikeMutation();
  const queryClient = useQueryClient();

  // Get engagement data from post, with reactive cache updates
  const engagement: PostEngagement = useMemo(() => {
    // First, try to get from post prop
    if (post.engagement) {
      return post.engagement;
    }

    // Fallback: try to get from cache
    const cachedPost = queryClient.getQueryData<InfiniteData<PostsPage, string | null>>(
      ["post-feed", "for-you"]
    );
    
    if (cachedPost) {
      const foundPost = cachedPost.pages
        .flatMap(page => page.posts)
        .find(p => p.id === post.id);
      
      if (foundPost?.engagement) {
        return foundPost.engagement;
      }
    }

    // Default fallback
    return {
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isShared: false,
    };
  }, [post, queryClient]);

  const handleLike = () => {
    if (!post.id) return;
    
    // Prevent duplicate likes
    if (likeMutation.isPending) return;
    
    likeMutation.mutate({
      postId: post.id,
      isLiked: engagement.isLiked,
    });
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  // Like icon with filled state
  const LikeIcon = (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      fill={engagement.isLiked ? "currentColor" : "none"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={engagement.isLiked ? "fill-current" : ""}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  return (
    <>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <div className="flex gap-4">
          <SocialActionButton
            icon={LikeIcon}
            count={engagement.likesCount}
            onClick={handleLike}
            isActive={engagement.isLiked}
            className={likeMutation.isPending ? "opacity-50 cursor-wait" : ""}
            disabled={likeMutation.isPending}
          />
          <SocialActionButton
            icon={Comment}
            count={engagement.commentsCount}
            onClick={handleComment}
            isActive={showComments}
          />
        </div>
        <div className="flex gap-2">
          <SocialIconButton
            icon={Share}
            onClick={handleShare}
            isActive={engagement.isShared}
          />
        </div>
      </div>

      {/* {showComments && post.id && (
        <CommentSection
          postId={post.id}
          onClose={() => setShowComments(false)}
        />
      )} */}

      {/* Share Dialog */}
      {/* {showShareDialog && post.id && (
        <ShareDialog
          postId={post.id}
          open={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )} */}

      {/* Report Dialog (can be triggered from post menu) */}
      {/* {showReportDialog && post.id && (
        <ReportDialog
          targetType="POST"
          targetId={post.id}
          open={showReportDialog}
          onClose={() => setShowReportDialog(false)}
        />
      )} */}
    </>
  );
};
