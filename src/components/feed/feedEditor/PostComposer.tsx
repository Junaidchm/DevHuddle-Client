"use client";

import React, { useState } from "react";
import { Image, FileText, CheckCircle, Calendar, Video } from "lucide-react";

import { ImageData, User } from "@/src/app/types/feed";
import dynamic from "next/dynamic";
import { MediaContext, MediaProvider } from "@/src/contexts/MediaContext";
import usePresignedProfileImage from "@/src/customHooks/usePresignedProfileImage";
import { PROFILE_DEFAULT_URL } from "@/src/constents";


const LazyCreatePostModal = dynamic(() => import("./CreatePostModal"), {
  ssr: false,
});
const LazyVideoEditorModal = dynamic(() => import("./VideoEdit"), {
  ssr: false,
});
const LazyPhotoEditorModal = dynamic(() => import("./PhotoEditorModal"), {
  ssr: false,
});
const LazyPollModal = dynamic(() => import("./PollModal"), { ssr: false });

interface PostComposerProps {
  userId: string;
}

export default  function PostComposer({ userId}: PostComposerProps) {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);

  const profileImage = usePresignedProfileImage();
  

  return (
    <MediaProvider>
      <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-sm ">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={profileImage ? profileImage : PROFILE_DEFAULT_URL}
            className="w-12 h-12 rounded-full object-cover"
            aria-label="User profile image"
          />
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full border border-slate-200 text-slate-500 transition-colors duration-200 ease-in-out cursor-pointer"
            aria-label="Start a post"
          >
            Start a post...
          </button>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex gap-1 sm:gap-4 flex-wrap">
            <button
              onClick={() => {
                setIsPhotoModalOpen(true);
                setIsCreatePostModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
              aria-label="Add photo"
            >
              <Image size={20} className="text-violet-500 flex-shrink-0" />
              <span className="hidden sm:inline">Photo</span>
            </button>
            <button
              onClick={() => {
                setVideoModalOpen(true);
                setIsCreatePostModalOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
              aria-label="Add event"
            >
              <Video size={20} className="text-red-500 flex-shrink-0" />
              <span className="hidden sm:inline">Video</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
              aria-label="Add article"
            >
              <FileText size={20} className="text-emerald-500 flex-shrink-0" />
              <span className="hidden sm:inline">Article</span>
            </button>
            {/* <button
            onClick={() => setIsPollModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
            aria-label="Add poll"
          >
            <CheckCircle size={20} className="text-amber-500 flex-shrink-0" />
            <span className="hidden sm:inline">Poll</span>
          </button> */}
          </div>
          {/* <button
          onClick={() => setIsCreatePostModalOpen(true)}
          className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-transform-shadow duration-200 ease-in-out shadow-sm hover:-translate-y-0.5 hover:shadow-lg ml-2"
          aria-label="Create post"
        >
          Post
        </button> */}
        </div>
        {isCreatePostModalOpen && (
          <LazyCreatePostModal
            isOpen={isCreatePostModalOpen}
            onClose={() => setIsCreatePostModalOpen(false)}
            profileImage={profileImage!}
          />
        )}
        {/* {isPhotoModalOpen && (
        <LazyPhotoEditorModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
        />
      )} */}
        {isVideoModalOpen && (
          <LazyVideoEditorModal
            isOpen={isVideoModalOpen}
            onClose={() => setVideoModalOpen(false)}
          />
        )}
      </div>
    </MediaProvider>
  );
}
