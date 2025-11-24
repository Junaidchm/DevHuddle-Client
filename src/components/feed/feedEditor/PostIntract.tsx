// "use client";

// import { Comment, Edit, Like, Share } from "@/src/constents/svg";
// import React from "react";

// // SocialActionButton component
// interface SocialActionButtonProps {
//   icon: React.ReactNode;
//   count?: number;
//   onClick?: () => void;
//   className?: string;
// }

// export const SocialActionButton: React.FC<SocialActionButtonProps> = ({
//   icon,
//   count,
//   onClick,
//   className = "",
// }) => (
//   <button
//     className={`bg-transparent border-none flex items-center gap-1.5 text-sm text-text-light cursor-pointer px-2 py-1 rounded transition-colors duration-200 ease-in-out hover:bg-gray-200 hover:text-gradient-start ${className}`}
//     onClick={onClick}
//   >
//     {icon}
//     {count !== undefined && count}
//   </button>
// );

// // SocialIconButton component
// interface SocialIconButtonProps {
//   icon: React.ReactNode;
//   onClick?: () => void;
//   className?: string;
// }

// export const SocialIconButton: React.FC<SocialIconButtonProps> = ({
//   icon,
//   onClick,
//   className = "",
// }) => (
//   <button
//     className={`bg-transparent border-none p-1 text-text-light cursor-pointer transition-colors duration-200 ease-in-out rounded hover:text-gradient-start ${className}`}
//     onClick={onClick}
//   >
//     {icon}
//   </button>
// );

// interface PostIntractProps {
//   actions?: {
//     likes?: { count: number; onClick?: () => void };
//     comments?: { count: number; onClick?: () => void };
//     share?: { onClick?: () => void };
//     edit?: { onClick?: () => void };
//     more?: { onClick?: () => void };
//   };
//   className?: string;
// }

// export const PostIntract: React.FC<PostIntractProps> = ({ actions }) => {
//   return (
//     <div className="flex justify-between items-center pt-3 border-t border-slate-100">
//       <div className="flex gap-6">
//         {true && (
//           <SocialActionButton
//             icon={Like}
//             count={3}
//             onClick={()=> {}}
//           />
//         )}
//         {true && (
//           <SocialActionButton
//             icon={Comment}
//             count={2}
//             onClick={()=> {}}
//           />
//         )}
//       </div>
//       <div className="flex gap-3">
//         {true && (
//           <SocialIconButton icon={Share} onClick={()=> {}} />
//         )}
//         {true && (
//           <SocialIconButton icon={Edit} onClick={()=> {}} />
//         )}
//       </div>
//     </div>
//   );
// };

"use client";

import { Comment, Edit, Like, Share } from "@/src/constents/svg";
import React, { useState } from "react";
import { NewPost, PostEngagement } from "@/src/app/types/feed";
// import { CommentSection } from "./CommentSection";
// import { ShareDialog } from "./ShareDialog";
// import { ReportDialog } from "./ReportDialog";
import { useLikeMutation } from "../mutations/useLikeMutation";

// SocialActionButton component
interface SocialActionButtonProps {
  icon: React.ReactNode;
  count?: number;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

export const SocialActionButton: React.FC<SocialActionButtonProps> = ({
  icon,
  count,
  onClick,
  className = "",
  isActive = false,
}) => (
  <button
    className={`bg-transparent border-none flex items-center gap-1.5 text-sm cursor-pointer px-2 py-1 rounded transition-all duration-200 ease-in-out hover:bg-gray-100 ${
      isActive
        ? "text-blue-600 fill-blue-600"
        : "text-gray-600 hover:text-blue-600"
    } ${className}`}
    onClick={onClick}
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

  // Get engagement data from post
  const engagement: PostEngagement = post.engagement || {
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    isShared: false,
  };

  const handleLike = () => {
    if (!post.id) return;
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
