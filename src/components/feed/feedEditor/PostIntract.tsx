"use client";

import { Comment, Edit as EditIcon, Like } from "@/src/constants/svg";
import React, { useState, useMemo } from "react";
import { NewPost, PostEngagement } from "@/src/app/types/feed";
import CommentSection from "./CommentSection";
import { CommentPreview } from "./CommentPreview";
import SendPostModal from "./SendPostModal";
import ReportPostModal from "./ReportPostModal";
import { useLikeMutation } from "../mutations/useLikeMutation";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { PostsPage } from "@/src/app/types/feed";
import { useCopyPostLink } from "./Hooks/useCopyPostLink";
import { MoreHorizontal, Link2, Flag, Edit, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import useGetUserData from "@/src/customHooks/useGetUserData";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/lib/utils";

// SocialActionButton component
interface SocialActionButtonProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
  disabled?: boolean;
}

export const SocialActionButton: React.FC<SocialActionButtonProps> = ({
  icon,
  label,
  count,
  onClick,
  className = "",
  isActive = false,
  disabled = false,
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn(
        "flex items-center gap-2 px-3 py-4 h-10 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        isActive && "text-primary hover:text-primary-hover font-semibold",
        className
    )}
    onClick={onClick}
    disabled={disabled}
    aria-label={`${label} ${count ? `(${count})` : ""}`}
  >
    {icon}
    <span className="text-sm font-medium hidden sm:inline">{label}</span>
    {count !== undefined && count > 0 && (
      <span className="font-medium text-xs sm:text-sm ml-0.5">{count}</span>
    )}
  </Button>
);

interface PostIntractProps {
  post: NewPost;
  className?: string;
}

export const PostIntract: React.FC<PostIntractProps> = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showPostMenu, setShowPostMenu] = useState(false);

  const likeMutation = useLikeMutation();
  const copyLinkMutation = useCopyPostLink();
  const queryClient = useQueryClient();
  const user = useGetUserData();
  
  // Get current user ID
  const currentUserId = user?.id || "";
  const isOwnPost = post.userId === currentUserId;

  // Auto-expand comments if commentId is present in URL
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const commentId = searchParams.get("commentId");
    if (commentId && !showComments) {
      setShowComments(true);
    }
  }, [showComments]);

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

  return (
    <>
      <div className="border-t border-border pt-2 mt-2">
        <div className="flex flex-wrap text-xs text-muted-foreground pb-2 px-1 justify-between items-center">
             <div className="flex items-center gap-1">
                 {engagement.likesCount > 0 && (
                     <>
                        <ThumbsUp className="w-3 h-3 fill-blue-500 text-blue-500 bg-white rounded-full" />
                        <span className="hover:text-blue-600 hover:underline cursor-pointer">{engagement.likesCount}</span>
                     </>
                 )}
             </div>
             <div className="flex items-center gap-2">
                {engagement.commentsCount > 0 && (
                    <span className="hover:text-blue-600 hover:underline cursor-pointer">{engagement.commentsCount} comments</span>
                )}
             </div>
        </div>

        <div className="flex justify-between items-center px-1">
            <SocialActionButton
                icon={<ThumbsUp className={cn("w-5 h-5", engagement.isLiked && "fill-current")} />}
                label="Like"
                onClick={handleLike}
                isActive={engagement.isLiked}
                className={likeMutation.isPending ? "opacity-50" : ""}
                disabled={likeMutation.isPending}
            />
            <SocialActionButton
                icon={<MessageSquare className="w-5 h-5" />}
                label="Comment"
                onClick={handleComment}
                isActive={showComments}
            />
            <SocialActionButton
                icon={<Share2 className="w-5 h-5" />}
                label="Share"
                onClick={handleSend}
            />
            {!isOwnPost && (
              <SocialActionButton
                icon={<Flag className="w-5 h-5" />}
                label="Report"
                onClick={handleReport}
              />
            )}
        </div>
      </div>

      {/* Comment Preview (LinkedIn-style: show first comment by default) */}
      {!showComments && post.id && (
        <CommentPreview
          postId={post.id}
          postAuthorId={post.userId}
          commentControl={post.commentControl}
          onLoadMore={() => setShowComments(true)}
        />
      )}

      {/* Full Comment Section (when expanded) */}
      {showComments && post.id && (
        <CommentSection
          postId={post.id}
          postAuthorId={post.userId}
          commentControl={post.commentControl}
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
          targetId={post.id}
          targetType="POST"
        />
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
