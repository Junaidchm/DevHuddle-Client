"use client";

import React, { useState, useRef, useContext, useEffect } from "react";
import {
  X,
  Image,
  Video,
  Smile,
  MoreHorizontal,
  BarChart2,
} from "lucide-react";
import PostSettingsModal from "./PostSettingsModal";
import { ImageData, User, Media, Poll, NewPost } from "@/src/app/types/feed";
import { boolean, z } from "zod";
import dynamic from "next/dynamic";
import PhotoEditorModal from "./PhotoEditorModal";
import {
  AudienceType,
  CommentControl,
  MediaContext,
  useMedia,
} from "@/src/contexts/MediaContext";
import PollModal from "./PollModal";
// import { useSubmitPostMutation } from "../mutations/useSubmitPostMutation";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import toast from "react-hot-toast";
import { getPresignedUrl } from "@/src/app/lib/general/getPresignedUrl";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { submitPost } from "./actions/submitPost";
import { updatePost } from "./actions/updatePost";
// import { anotheruseSubmitPostMutation } from "../mutations/useSubmitPostMutation"; // Removed
import { useEditPost } from "./Hooks/useEditPost";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import { useMediaUpload } from "@/src/hooks/useMediaUpload";
import { useSession } from "next-auth/react";
import useGetUserData from "@/src/customHooks/useGetUserData";
import { MentionList } from "./MentionList";
import { getCursorXY } from "@/src/app/lib/general/getCursorXY";
import { searchUsers, SearchedUser } from "@/src/services/api/user.service";
import { useQuery } from "@tanstack/react-query";

const LazyPostSettingsModal = dynamic(() => import("./PostSettingsModal"), {
  ssr: false,
});
const LazyPhotoEditorModal = dynamic(() => import("./PhotoEditorModal"), {
  ssr: false,
});
const LazyPollModal = dynamic(() => import("./PollModal"), { ssr: false });
const LazyVideoEditorModal = dynamic(() => import("./VideoEdit"), {
  ssr: false,
});

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileImage?: string;
  postToEdit?: NewPost; // ✅ Added: Optional post to edit
}

export default function CreatePostModal({
  isOpen,
  onClose,
  postToEdit, // ✅ Added: Optional post to edit
}: CreatePostModalProps) {
  const [postContent, setPostContent] = useState("");
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showPostSettings, setShowPostSettings] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  // ✅ FIXED P0-10: Use shared QueryClient from provider instead of creating new instance
  const queryClient = useQueryClient();

  const {
    type,
    audienceType,
    settingAudienceType,
    commentControl,
    settingCommentControl,
    setMedia,
    media,
  } = useMedia();

  const { reset: resetMediaUploads } = useMediaUpload();

  // ✅ Added: Determine if we're editing or creating
  const isEditing = !!postToEdit;

  // ✅ Added: Edit mutation hook
  const editMutation = useEditPost();

  // ✅ Refactored: Use React Query mutation for server action
  const { mutate: submitPostMutation, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: any) => {
        const result = await submitPost(data);
        if (!result.success) throw new Error(result.error || result.message);
        return result;
    },
    onSuccess: () => {
      resetMediaUploads();
      setMedia([]);
      setPostContent("");
      setPoll(null);
      setError("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onClose();
      toast.success("Post shared successfully!");
    },
    onError: (err: Error) => {
        setError(err.message);
        toast.error(err.message);
    }
  });

  const { data: session } = useSession(); // ✅ Use session for auth

  // ✅ Mentions State
  const [mentionQuery, setMentionQuery] = useState("");
  const [isMentioning, setIsMentioning] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ Fetch Users for Mention
  const { data: mentionedUsers = [] } = useQuery({
    queryKey: ["searchUsers", mentionQuery],
    queryFn: () =>
      searchUsers(mentionQuery, {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      }),
    enabled: isMentioning && mentionQuery.length > 0,
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPostContent(newValue);

    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, selectionStart);
    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith("@")) {
      const query = lastWord.slice(1);
      setIsMentioning(true);
      setMentionQuery(query);

      // Calculate position
      if (textareaRef.current) {
        const { x, y } = getCursorXY(textareaRef.current, selectionStart);
        // Adjust for modal position/scroll
         const lineHeight = 24; 
         setMentionPosition({ top: y + lineHeight, left: x });
      }
    } else {
      setIsMentioning(false);
      setMentionQuery("");
    }
  };

  const handleMentionSelect = (user: SearchedUser) => {
    if (!textareaRef.current) return;

    const selectionStart = textareaRef.current.selectionStart;
    const textBeforeCursor = postContent.substring(0, selectionStart);
    const textAfterCursor = postContent.substring(selectionStart);

    const words = textBeforeCursor.split(/\s+/);
    const lastWord = words[words.length - 1];
    
    // Replace @query with @[username](id)
    const mentionText = `@[${user.username}](${user.id}) `;
    
    // Remove the partial mention text (@query)
    const textWithoutLastWord = textBeforeCursor.slice(0, -lastWord.length);
    
    const newContent = textWithoutLastWord + mentionText + textAfterCursor;
    
    setPostContent(newContent);
    setIsMentioning(false);
    setMentionQuery("");
    
    // Reset focus
    textareaRef.current.focus();
  };

  const user = useGetUserData();

  // ✅ Added: Track initialization to prevent infinite loops
  const previousIsOpen = useRef(false);
  const previousPostId = useRef<string | undefined>(undefined);

  // ✅ Added: Pre-fill form when editing (fixed infinite loop)
  useEffect(() => {
    // Only initialize when modal transitions from closed to open
    const justOpened = !previousIsOpen.current && isOpen;
    const postChanged = previousPostId.current !== postToEdit?.id;

    if (!justOpened && !postChanged) {
      previousIsOpen.current = isOpen;
      return;
    }

    // Skip if modal is closed
    if (!isOpen) {
      previousIsOpen.current = false;
      previousPostId.current = undefined;
      return;
    }

    // Initialize form based on edit or create mode
    if (postToEdit?.id) {
      // Editing: Pre-fill with post data
      setPostContent(postToEdit.content || "");
      
      if (postToEdit.visibility) {
        settingAudienceType(postToEdit.visibility as AudienceType);
      }
      if (postToEdit.commentControl) {
        settingCommentControl(postToEdit.commentControl as CommentControl);
      }

      if (postToEdit.attachments && postToEdit.attachments.length > 0) {
        const existingMedia: Media[] = postToEdit.attachments.map((att) => ({
          id: att.id,
          name: att.url.split("/").pop() || "media",
          type: att.type === "IMAGE" ? "image/jpeg" : "video/mp4",
          url: att.url,
          mediaId: att.id,
        }));
        setMedia(existingMedia);
      } else {
        setMedia([]);
      }

      previousPostId.current = postToEdit.id;
    } else {
      // Creating: Reset form
      setPostContent("");
      setMedia([]);
      setPoll(null);
      settingAudienceType(AudienceType.PUBLIC);
      settingCommentControl(CommentControl.ANYONE);

      previousPostId.current = undefined;
    }

    previousIsOpen.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, postToEdit?.id]); // Only depend on isOpen and postToEdit.id

  async function onSubmit() {
    if (!postContent.trim() && media.length == 0 && !poll) {
      toast.error("Please add content, media, or a poll.");
      return;
    }

    setIsPosting(true);
    setError("");

    try {
      // ✅ BUG FIX: Extract mediaIds properly and validate
      const mediaIds = media
        .map((m) => m.mediaId)
        .filter((id): id is string => Boolean(id));

      // Validate that all new media has been uploaded (has mediaId)
      // Existing media from postToEdit already has mediaId
      const uploadingMedia = media.filter((m) => !m.mediaId);
      if (uploadingMedia.length > 0) {
        toast.error("Please wait for media to finish uploading before posting.");
        setIsPosting(false);
        return;
      }

      // ✅ Added: Handle edit mode
      if (isEditing && postToEdit?.id) {
        // Get existing attachment IDs from postToEdit
        const existingAttachmentIds = postToEdit.attachments?.map((att) => att.id) || [];
        
        // Find newly added media (has mediaId but not in existing attachments)
        const newMediaIds = mediaIds.filter(
          (id) => !existingAttachmentIds.includes(id)
        );
        
        // Find removed media (was in existing attachments but not in current media)
        const removedAttachmentIds = existingAttachmentIds.filter(
          (existingId) => !mediaIds.includes(existingId)
        );

        // Update post using edit mutation
        await editMutation.mutateAsync({
          postId: postToEdit.id,
          data: {
            content: postContent.trim() || undefined,
            addAttachmentIds: newMediaIds.length > 0 ? newMediaIds : undefined,
            removeAttachmentIds: removedAttachmentIds.length > 0 ? removedAttachmentIds : undefined,
          },
        });

        // Reset and close
        resetMediaUploads();
        setMedia([]);
        setPostContent("");
        onClose();
        toast.success("Post updated successfully!");
        setIsPosting(false);
        return;
      }

      // ✅ Create new post (existing logic)
      const tempPostId = `temp-${Date.now()}-${Math.random()}`;

      const optimisticPost: NewPost = {
        content: postContent,
        mediaIds: mediaIds,
        createdAt: String(new Date().toISOString()),
        user: {
          avatar: user?.image as string,
          name: user?.name as string,
          username: user?.username,
        },
        id: tempPostId,
        userId: user?.id as string,
        visibility: audienceType,
        commentControl: commentControl,
        attachments: media.map((file) => {
          return {
            id: `temp-${Date.now()}-${Math.random()}`,
            createdAt: String(new Date().toISOString()),
            postId: tempPostId,
            type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
            url: file.url as string,
          };
        }),
      };

      submitPostMutation(optimisticPost);
    } catch (err: any) {
      toast.error("Error submitting post please try again ");
      setIsPosting(false);
    }
  }

  if (!isOpen) return null;

  // ✅ FIXED P0-11: Removed console.log from production code

  return (
    <>
      <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}${user?.image}`}
                alt={`${user?.name}'s Avatar`}
                className="w-12 h-12 rounded-full object-cover"
                aria-label="User avatar"
              />
              <div>
                <h3 className="font-semibold text-slate-800">{user?.name}</h3>
                <button
                  onClick={() => setShowPostSettings(true)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="Select post audience"
                >
                  <span>
                    {isEditing ? "Edit" : "Post"} to{" "}
                    {audienceType === "PUBLIC" ? "Anyone" : "Connections only"}
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Close modal"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto relative">
            <textarea
              ref={textareaRef}
              name="content"
              value={postContent}
              onChange={handleContentChange}
              placeholder="What do you want to talk about?"
              className="w-full h-48 text-lg placeholder-gray-400 border-none outline-none resize-none font-light"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
              aria-label="Post content input"
            />
            {isMentioning && (
              <MentionList
                users={mentionedUsers}
                onSelect={handleMentionSelect}
                position={mentionPosition}
              />
            )}
            {media.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {media.map((mediaItem: Media) => {
                  // ✅ BUG FIX: Check media type correctly (file.type or media.type)
                  const isImage = mediaItem.type?.includes("image") || 
                                 mediaItem.type === "image" ||
                                 (mediaItem.file && mediaItem.file.type.startsWith("image"));
                  
                  return (
                    <div
                      key={mediaItem.id}
                      className="relative bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        {isImage ? (
                          <img
                            src={mediaItem.url}
                            alt={mediaItem.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <video
                            src={mediaItem.url}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium text-sm">{mediaItem.name}</div>
                          {mediaItem.mediaId ? (
                            <div className="text-xs text-green-600">✓ Uploaded</div>
                          ) : (
                            <div className="text-xs text-yellow-600">
                              ⏳ {mediaItem.url ? "Processing..." : "Uploading..."}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* ✅ BUG FIX: Add remove functionality */}
                      <button
                        onClick={() => {
                          // Remove media from context
                          const updatedMedia = media.filter((m) => m.id !== mediaItem.id);
                          setMedia(updatedMedia);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        aria-label={`Remove ${mediaItem.name}`}
                      >
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {poll && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-slate-700">{poll.question}</p>
                <div className="mt-2 space-y-2">
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        disabled
                        className="text-violet-500"
                        aria-label={`Poll option: ${option.text}`}
                      />
                      <span className="text-sm text-slate-600">
                        {option.text}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Poll ends in {poll.durationDays} days
                </p>
              </div>
            )}
          </div>
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // fileInputRef.current?.click()
                  setShowPhotoEditor(true);
                }}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add photos"
              >
                <Image size={20} className="text-gray-600" />
              </button>
              <button
                // ✅ BUG FIX: Add onClick handler to open video editor modal
                onClick={() => setShowVideoEditor(true)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add videos"
              >
                <Video size={20} className="text-gray-600" />
              </button>
              <button
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add emoji"
              >
                <Smile size={20} className="text-gray-600" />
              </button>
              <button
                // ✅ BUG FIX: Poll button should open poll modal, not photo editor
                onClick={() => setShowPollModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
                aria-label="Add poll"
              >
                <BarChart2 size={20} className="text-gray-600" />
              </button>
              <button
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
          {/* <div className="px-6 pb-4">
            <button
              // onClick={rewriteWithAI}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Rewrite with AI"
            >
              <span className="text-orange-500 font-bold">✨</span>
              <span className="text-gray-700 font-medium">Rewrite with AI</span>
            </button>
          </div> */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">⏰</span>
            </div>
            <button
              onClick={onSubmit}
              className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 ${
                true
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              aria-label="Submit post"
            >
              {isPosting 
                ? (isEditing ? "Saving..." : "Posting...") 
                : (isEditing ? "Save" : "Post")}
            </button>
          </div>
        </div>
      </div>
      {showPostSettings && (
        <LazyPostSettingsModal
          isOpen={showPostSettings}
          onClose={() => setShowPostSettings(false)}
          audienceType={audienceType}
          setAudienceType={settingAudienceType}
          commentControl={commentControl}
          setCommentControl={settingCommentControl}
        />
      )}
      {showPhotoEditor && (
        <LazyPhotoEditorModal
          isOpen={showPhotoEditor}
          onClose={() => setShowPhotoEditor(false)}
        />
      )}
      {/* ✅ BUG FIX: Add video editor modal */}
      {showVideoEditor && (
        <LazyVideoEditorModal
          isOpen={showVideoEditor}
          onClose={() => setShowVideoEditor(false)}
        />
      )}
      {/* ✅ BUG FIX: Add poll modal */}
      {showPollModal && (
        <LazyPollModal
          isOpen={showPollModal}
          onClose={() => setShowPollModal(false)}
        />
      )}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-70 flex items-center space-x-2">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-500 text-sm">✓</span>
          </div>
          <span>Post shared successfully!</span>
        </div>
      )}
    </>
  );
}
