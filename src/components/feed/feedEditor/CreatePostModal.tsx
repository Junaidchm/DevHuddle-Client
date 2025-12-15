"use client";

import React, { useState, useRef, useContext, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  Video,
  Smile,
  MoreHorizontal,
  BarChart2,
} from "lucide-react";
import {  Poll, NewPost } from "@/src/app/types/feed";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { usePostForm } from "@/src/hooks/feed/usePostForm";
import { useMentions } from "@/src/hooks/feed/useMentions";
import {PostMediaItem } from "@/src/contexts/PostCreationContext";
import {useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useGetUserData from "@/src/customHooks/useGetUserData";
import { MentionList } from "./MentionList";
import { searchUsers, SearchedUser } from "@/src/services/api/user.service";
import { useSubmitPostMutation } from "../mutations/useSubmitPostMutation";
import { useUpdatePostMutation } from "../mutations/useUpdatePostMutation";
import { queryKeys } from "@/src/lib/queryKeys";

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
  // ✅ Refactored: Using unified store
  const { 
    content, 
    setContent, 
    media, 
    removeMedia, 
    settings, 
    updateSettings,
    uploadProgress, 
    status,
    reset,
    setEditingPost
  } = usePostForm();

  // ✅ Refactored: Simplified Mentions
  const { mentionState, handleInput, insertMention, closeMentions } = useMentions();
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // States for sub-modals
  const [showPostSettings, setShowPostSettings] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null); // Poll still local for now as it's separate complex object

  const [showSuccess, setShowSuccess] = useState(false);
  
  // ✅ Track active media for editing
  const [activeMediaId, setActiveMediaId] = useState<string | undefined>(undefined);

  const { data: session } = useSession();
  const userData = useGetUserData(); // keep existing user data hook

  // ✅ Initialize Edit Mode
  const isEditing = !!postToEdit;
  
  // Track initialization
  const initialized = useRef(false);

  useEffect(() => {
    if (isOpen && !initialized.current) {
        if (postToEdit) {
            setEditingPost(postToEdit);
        } else {
            reset();
        }
        initialized.current = true;
    }
    if (!isOpen) {
        initialized.current = false;
    }
  }, [isOpen, postToEdit, setEditingPost, reset]);


  // ✅ Mutations
  const createPostMutation = useSubmitPostMutation();
  const updatePostMutation = useUpdatePostMutation();

  // ✅ Fetch Users for Mention
  const { data: mentionedUsers = [] } = useQuery({
    queryKey: queryKeys.users.search(mentionState.query),
    queryFn: () =>
      searchUsers(mentionState.query, {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      }),
    enabled: mentionState.isActive && mentionState.query.length > 0,
  });

  const handleMentionSelect = (user: SearchedUser) => {
      const newContent = insertMention(user, content, textareaRef.current);
      setContent(newContent);
      closeMentions();
      textareaRef.current?.focus();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      handleInput(e);
  };

  // ✅ Handle Media Click (Open Editor)
  const handleMediaClick = (item: PostMediaItem) => {
     setActiveMediaId(item.id);
     if (item.type === "IMAGE") {
         setShowPhotoEditor(true);
     } else if (item.type === "VIDEO") {
         setShowVideoEditor(true);
     }
  };

  // ✅ Submit Logic
  const handleSubmit = async () => {
        try {
            // Validation
            if (!content.trim() && media.length === 0 && !poll) {
                throw new Error("Please add content, media, or a poll.");
            }
            
            // Wait for uploads
            if (media.some(m => m.uploadStatus === "UPLOADING" || m.uploadStatus === "PENDING")) {
                 throw new Error("Please wait for uploads to finish.");
            }
    
            // Filter valid media IDs
            const mediaIds = media
                .filter(m => m.uploadStatus === "COMPLETED" && m.remoteId)
                .map(m => m.remoteId as string);
    
            if (isEditing && postToEdit?.id) {
                 // ... Edit Logic
                  const existingAttachmentIds = postToEdit.attachments?.map((att) => att.id) || [];
                  const newMediaIds = mediaIds.filter(id => !existingAttachmentIds.includes(id));
                  const removedAttachmentIds = existingAttachmentIds.filter(id => !mediaIds.includes(id));
    
                  await updatePostMutation.mutateAsync({
                     id: postToEdit.id,
                     content: content.trim() || undefined,
                     addAttachmentIds: newMediaIds.length ? newMediaIds : undefined,
                     removeAttachmentIds: removedAttachmentIds.length ? removedAttachmentIds : undefined
                  });

            } else {
                  // Create Logic
                  await createPostMutation.mutateAsync({
                      content: content,
                      mediaIds: mediaIds,
                      visibility: settings.visibility,
                      commentControl: settings.commentControl,
                  });
            }

            // Success Handling
            reset();
            setPoll(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
            onClose();
            toast.success(isEditing ? "Post updated!" : "Post created!");
            
        } catch (error: any) {
            toast.error(error.message);
        }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}${userData?.image}`}
                alt="Avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-slate-800">{userData?.name}</h3>
                <button
                  onClick={() => setShowPostSettings(true)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span>
                    {isEditing ? "Edit" : "Post"} to{" "}
                    {settings.visibility === "PUBLIC" ? "Anyone" : "Connections only"}
                  </span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-6 flex-1 overflow-y-auto relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextChange}
              placeholder="What do you want to talk about?"
              className="w-full h-48 text-lg placeholder-gray-400 border-none outline-none resize-none font-light"
            />
            
            {mentionState.isActive && (
              <MentionList
                users={mentionedUsers}
                onSelect={handleMentionSelect}
                position={mentionState.position}
              />
            )}

            {/* Media List */}
            {media.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {media.map((item) => (
                  <div 
                    key={item.id} 
                    className="relative bg-gray-50 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors group"
                    onClick={() => handleMediaClick(item)}
                  >
                    <div className="flex items-center space-x-3 pointer-events-none">
                      {item.type === "IMAGE" ? (
                         <img src={item.url} className="w-12 h-12 object-cover rounded" />
                      ) : (
                         <video src={item.url} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{item.name || "Media"}</div>
                        {item.uploadStatus === "COMPLETED" && (
                             <div className="text-xs text-green-600">✓ Uploaded</div>
                        )}
                        {item.uploadStatus === "UPLOADING" && (
                             <div className="text-xs text-blue-600">Uploading...</div>
                        )}
                        {item.uploadStatus === "ERROR" && (
                             <div className="text-xs text-red-600">Failed</div>
                        )}
                      </div>
                    </div>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            removeMedia(item.id);
                        }} 
                        className="p-1 hover:bg-gray-200 rounded-full pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Poll Display (Simplified) */}
            {poll && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg relative">
                    <button onClick={() => setPoll(null)} className="absolute top-2 right-2 text-gray-500">
                        <X size={16} />
                    </button>
                    <p className="font-medium">{poll.question}</p>
                    <p className="text-xs text-gray-500">{poll.options.length} options</p>
                </div>
            )}

          </div>

          {/* Tools */}
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowPhotoEditor(true)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
               >
                <ImageIcon size={20} className="text-gray-600" />
              </button>
              <button 
                onClick={() => setShowVideoEditor(true)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                <Video size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Smile size={20} className="text-gray-600" />
              </button>
              <button onClick={() => setShowPollModal(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                <BarChart2 size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
             <div className="text-sm text-gray-500">
                {status === "UPLOADING" && `Uploading... ${uploadProgress}%`}
             </div>
             <button
               onClick={() => handleSubmit()}
               disabled={status === "UPLOADING" || (!content && !media.length && !poll)}
               className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 ${
                 status === "UPLOADING" || (!content && !media.length && !poll)
                   ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                   : "bg-blue-600 text-white hover:bg-blue-700"
               }`}
             >
               {status === "SUBMITTING" ? "Posting..." : (isEditing ? "Save" : "Post")}
             </button>
          </div>
        </div>
      </div>

      {showPostSettings && (
        <LazyPostSettingsModal
          isOpen={showPostSettings}
          onClose={() => setShowPostSettings(false)}
        />
      )}
      
      {showPhotoEditor && (
        <LazyPhotoEditorModal
            isOpen={showPhotoEditor}
            onClose={() => {
                setShowPhotoEditor(false);
                setActiveMediaId(undefined); // Reset active ID on close
            }}
            initialImageId={activeMediaId} // ✅ Pass active ID
        />
      )}
      
      {showVideoEditor && (
        <LazyVideoEditorModal
            isOpen={showVideoEditor}
            onClose={() => {
                setShowVideoEditor(false);
                setActiveMediaId(undefined); // Reset active ID on close
            }}
            initialVideoId={activeMediaId} // ✅ Pass active ID
        />
      )}

      {showPollModal && (
        <LazyPollModal
            isOpen={showPollModal}
            onClose={() => setShowPollModal(false)}
        />
      )}

      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-70 flex items-center space-x-2">
           <span>✓ Post shared successfully!</span>
        </div>
      )}
    </>
  );
}
