'use client'
import { Media, NewPost, Post } from "@/src/app/types/feed";
import React, { useState, useRef, useEffect } from "react";
import { PostIntract } from "./PostIntract";
import { formatRelativeDate } from "@/src/utils/formateRelativeDate";
import DeletePostDialog from "./DeletePostModal";
import { useCopyPostLink } from "./Hooks/useCopyPostLink";
import { PROFILE_DEFAULT_URL } from "@/src/constents";

interface PostProp {
  post: NewPost;
  onDeletePost?: (postId: string) => void;
  userid:string
}

// Attachment interface based on your data structure
interface Attachment {
id: string,
postId:string;
type:string;
url: string,
createdAt: string
}

// ✅ Video Player Component
const VideoPlayer = ({ attachments }: { attachments: Attachment[] }) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter only VIDEO type attachments
  const videoAttachments = attachments.filter(
    (attachment) => attachment.type === "VIDEO"
  );

  if (!videoAttachments || videoAttachments.length === 0) return null;

  const nextVideo = () => {
    setCurrentVideoIndex((prev) =>
      prev === videoAttachments.length - 1 ? 0 : prev + 1
    );
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) =>
      prev === 0 ? videoAttachments.length - 1 : prev - 1
    );
  };

  const goToVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  return (
    <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
      {/* Main Video Display - Responsive container that adapts to video aspect ratio */}
      <div className="relative w-full flex items-center justify-center" style={{ minHeight: '200px', maxHeight: '700px' }}>
        {/* Video Container */}
        <video
          ref={videoRef}
          src={videoAttachments[currentVideoIndex].url.startsWith("http") ? videoAttachments[currentVideoIndex].url : `${process.env.NEXT_PUBLIC_IMAGE_PATH}${videoAttachments[currentVideoIndex].url}`}
          controls
          className="w-full h-auto max-h-[700px] object-contain block"
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
          onLoadStart={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
            }
          }}
        />

        {/* Navigation Arrows - Only show if more than 1 video */}
        {videoAttachments.length > 1 && (
          <>
            {/* Previous Arrow */}
            <button
              onClick={prevVideo}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
              aria-label="Previous video"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>

            {/* Next Arrow */}
            <button
              onClick={nextVideo}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
              aria-label="Next video"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>

            {/* Video Counter */}
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
              {currentVideoIndex + 1} / {videoAttachments.length}
            </div>
          </>
        )}
      </div>

      {/* Dot Indicators - Only show if more than 1 video */}
      {videoAttachments.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {videoAttachments.map((_, index) => (
            <button
              key={index}
              onClick={() => goToVideo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentVideoIndex
                  ? "bg-white"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ImageCarousel = ({ attachments }: { attachments: Attachment[] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Filter only IMAGE type attachments
  const imageAttachments = attachments.filter(
    (attachment) => attachment.type === "IMAGE"
  );

  if (!imageAttachments || imageAttachments.length === 0) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imageAttachments.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imageAttachments.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };


  // Helper to construct media URL
  const getMediaUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("blob:")) return url;
    return `${process.env.NEXT_PUBLIC_IMAGE_PATH}${url}`;
  };

  return (
    <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Main Image Display - Responsive container that adapts to image aspect ratio */}
      <div className="relative w-full flex items-center justify-center" style={{ minHeight: '200px', maxHeight: '700px' }}>
        {/* Image Container */}
        <img
          src={getMediaUrl(imageAttachments[currentImageIndex].url)}
          alt={`Post image ${currentImageIndex + 1}`}
          className="w-full h-auto max-h-[700px] object-contain block"
          style={{
            maxWidth: '100%',
            height: 'auto',
          }}
          loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
        />

        {/* Navigation Arrows - Only show if more than 1 image */}
        {imageAttachments.length > 1 && (
          <>
            {/* Previous Arrow */}
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>

            {/* Next Arrow */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>

            {/* Image Counter */}
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full z-10">
              {currentImageIndex + 1} / {imageAttachments.length}
            </div>
          </>
        )}
      </div>

      {/* Dot Indicators - Only show if more than 1 image */}
      {imageAttachments.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {imageAttachments.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentImageIndex
                  ? "bg-white"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ Copy Link Button Component (LinkedIn-style)
const CopyLinkButton = ({ postId, onClose }: { postId: string; onClose: () => void }) => {
  const copyLinkMutation = useCopyPostLink();

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!postId) return;
    
    try {
      await copyLinkMutation.mutateAsync({
        postId,
        generateShort: true,
      });
      onClose(); // Close menu after successful copy
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <button
      onClick={handleCopyLink}
      disabled={copyLinkMutation.isPending}
      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-3"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
      </svg>
      {copyLinkMutation.isPending ? "Copying..." : "Copy link to post"}
    </button>
  );
};

export default function PostCard({ post, onDeletePost,userid }: PostProp) {

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);


  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  // Position menu relative to button
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 8, left: rect.right - 192 });
    }
  }, [showMenu]);

  return (
    <>
      <article className="bg-white rounded-xl border border-slate-200 shadow-sm transition-transform-shadow duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg-hover relative">
        {/* Three-dot menu */}
        <div className="absolute top-4 right-4 z-10">
          <button
            ref={buttonRef}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Post options"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-500"
            >
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="19" cy="12" r="1" fill="currentColor" />
              <circle cx="5" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <img
                src={post.user?.avatar ? `${process.env.NEXT_PUBLIC_IMAGE_PATH}${post.user?.avatar}` : PROFILE_DEFAULT_URL}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
                aria-label="Author avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PROFILE_DEFAULT_URL;
                }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-gray-900">
                    @{post.user?.username}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {formatRelativeDate(new Date(post.createdAt))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-4 text-sm text-slate-700 leading-relaxed">
            {post.content}
          </p>

          {/* Media Attachments Section (Images and Videos) */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mb-4 space-y-4">
              {/* Render Images */}
              <ImageCarousel attachments={post.attachments} />
              
              {/* Render Videos */}
              <VideoPlayer attachments={post.attachments} />
            </div>
          )}

          <PostIntract post={post} />  
        </div>
      </article>

      {/* Dropdown menu rendered in fixed position */}
      {showMenu && menuPosition && (
        <>
          {/* Click outside to close */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowMenu(false)}
          />

          <div
            className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[1000]"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {/* Edit post */}
            {post.userId === userid && (
              <button
                onClick={() => setShowMenu(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit post
              </button>
            )}

            {/* Save */}
            {/* <button
              onClick={() => setShowMenu(false)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17,21 17,13 7,13 7,21" />
                <polyline points="7,3 7,8 15,8" />
              </svg>
              Save
            </button> */}

            {/* Copy link */}
            {/* <CopyLinkButton postId={post.id} onClose={() => setShowMenu(false)} /> */}

            <div className="border-t border-gray-200 my-1"></div>

            {/* Delete post */}
            {post.userId === userid && (
              <button
                onClick={handleDeleteClick}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Delete post
              </button>
            )}
          </div>
        </>
      )}

      {post.userId === userid && (
        <DeletePostDialog
          post={post}
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  );
}
