"use client";

import { Comment, Edit as EditIcon, Like } from "@/src/constents/svg";
import React, { useState, useMemo } from "react";
import { NewPost, PostEngagement } from "@/src/app/types/feed";
import CommentSection from "./CommentSection";
import { CommentPreview } from "./CommentPreview";
import SendPostModal from "./SendPostModal";
import ReportPostModal from "./ReportPostModal";
import CreatePostModal from "./CreatePostModal";
import { MediaProvider } from "@/src/contexts/MediaContext";
import { useLikeMutation } from "../mutations/useLikeMutation";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { PostsPage } from "@/src/app/types/feed";
import { useCopyPostLink } from "./Hooks/useCopyPostLink";
import { MoreHorizontal, Link2, Flag, Edit, Send } from "lucide-react";
import toast from "react-hot-toast";
import useGetUserData from "@/src/customHooks/useGetUserData";

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

interface PostIntractProps {
  post: NewPost;
  className?: string;
}

export const PostIntract: React.FC<PostIntractProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);

  const likeMutation = useLikeMutation();
  const copyLinkMutation = useCopyPostLink();
  const queryClient = useQueryClient();
  const user = useGetUserData();
  
  // Get current user ID
  const currentUserId = user?.id || "";
  const isOwnPost = post.userId === currentUserId;

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
    isLiked: false,
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

  const handleSend = () => {
    setShowSendDialog(true);
  };

  const handleCopyLink = async () => {
    if (!post.id) return;
    try {
      await copyLinkMutation.mutateAsync({
        postId: post.id,
        generateShort: true,
      });
      setShowPostMenu(false);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReport = () => {
    setShowReportDialog(true);
    setShowPostMenu(false);
  };

  const handleEdit = () => {
    setShowEditDialog(true);
    setShowPostMenu(false);
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
      <div className="border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 pb-3">
          <span>
            <strong>{engagement.likesCount}</strong> likes
          </span>
          <span>•</span>
          <span>
            <strong>{engagement.commentsCount}</strong> comments
          </span>
        </div>

        <div className="flex justify-between items-center">
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
        <div className="flex gap-2 items-center">
          <SocialActionButton
            icon={<Send className="w-5 h-5" />}
            onClick={handleSend}
          />
          {/* Post Menu */}
          {/* <div className="relative">
            <button
              onClick={() => setShowPostMenu(!showPostMenu)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>
            {showPostMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  disabled={copyLinkMutation.isPending}
                >
                  <Link2 className="w-4 h-4" />
                  {copyLinkMutation.isPending ? "Copying..." : "Copy link"}
                </button>
                {isOwnPost && (
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit post
                  </button>
                )}
                {!isOwnPost && (
                  <button
                    onClick={handleReport}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                  >
                    <Flag className="w-4 h-4" />
                    Report post
                  </button>
                )}
              </div>
            )}
          </div> */}
          </div>
        </div>
      </div>

      {/* Comment Preview (LinkedIn-style: show first comment by default) */}
      {!showComments && post.id && (
        <CommentPreview
          postId={post.id}
          postAuthorId={post.userId}
          onLoadMore={() => setShowComments(true)}
        />
      )}

      {/* Full Comment Section (when expanded) */}
      {showComments && post.id && (
        <CommentSection
          postId={post.id}
          postAuthorId={post.userId}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Send Dialog */}
      {showSendDialog && post.id && (
        <SendPostModal
          isOpen={showSendDialog}
          onClose={() => setShowSendDialog(false)}
          postId={post.id}
          post={post}
        />
      )}

      {/* Report Dialog */}
      {showReportDialog && post.id && (
        <ReportPostModal
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          postId={post.id}
          targetType="POST"
        />
      )}

      {/* ✅ FIXED: Use CreatePostModal for editing - reuses same UI */}
      {showEditDialog && post && (
        <MediaProvider>
          <CreatePostModal
            isOpen={showEditDialog}
            onClose={() => setShowEditDialog(false)}
            postToEdit={post}
          />
        </MediaProvider>
      )}

      {/* Close menu when clicking outside */}
      {showPostMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowPostMenu(false)}
        />
      )}
    </>
  );
};
