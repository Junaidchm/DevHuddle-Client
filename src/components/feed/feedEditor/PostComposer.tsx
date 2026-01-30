"use client";
import { useState, useEffect } from "react";
import { PostCreationProvider } from "@/src/contexts/PostCreationContext";
import dynamic from "next/dynamic";
import { Image, FileText, Video } from "lucide-react";
import usePresignedProfileImage from "@/src/customHooks/usePresignedProfileImage";
import { PROFILE_DEFAULT_URL } from "@/src/constents";

const LazyCreatePostModal = dynamic(() => import("./CreatePostModal"), {
  ssr: false,
});

interface PostComposerProps {
  userId: string;
}

export default function PostComposer({ userId }: PostComposerProps) {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const profileImage = usePresignedProfileImage();
  const [imageSrc, setImageSrc] = useState(PROFILE_DEFAULT_URL);

  useEffect(() => {
    if (profileImage) {
      setImageSrc(profileImage);
    }
  }, [profileImage]);

  return (
    <PostCreationProvider>
      <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-sm ">
        <div className="flex items-center gap-3 mb-4">
          <img
            src={imageSrc}
            onError={() => setImageSrc(PROFILE_DEFAULT_URL)}
            className="w-12 h-12 rounded-full object-cover"
            alt="Profile"
          />
          <button
            onClick={() => setIsCreatePostModalOpen(true)}
            className="flex-1 text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-full border border-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            Start a post...
          </button>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex gap-1 sm:gap-4 flex-wrap">
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <Image size={20} className="text-violet-500 flex-shrink-0" />
              <span className="hidden sm:inline">Photo</span>
            </button>
            <button
              onClick={() => setIsCreatePostModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <Video size={20} className="text-red-500 flex-shrink-0" />
              <span className="hidden sm:inline">Video</span>
            </button>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <FileText size={20} className="text-emerald-500 flex-shrink-0" />
              <span className="hidden sm:inline">Article</span>
            </button>
          </div>
        </div>
        {isCreatePostModalOpen && (
          <LazyCreatePostModal
            isOpen={isCreatePostModalOpen}
            onClose={() => setIsCreatePostModalOpen(false)}
          />
        )}
      </div>
    </PostCreationProvider>
  );
}
