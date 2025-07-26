
'use client';

import React, { useState } from 'react';
import { Image, FileText, CheckCircle, Calendar } from 'lucide-react';

import { User } from '@/src/app/types/feed';
import PollModal from './PollModal';
import PhotoEditorModal from './PhotoEditorModal';
import CreatePostModal from './CreatePostModal';

interface PostComposerProps {
  userId: string;
  user: User;
}

export default function PostComposer({ userId, user }: PostComposerProps) {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={user.avatar}
          alt={`${user.name}'s Profile`}
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
            onClick={() => setIsPhotoModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
            aria-label="Add photo"
          >
            <Image size={20} className="text-violet-500 flex-shrink-0" />
            <span className="hidden sm:inline">Photo</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
            aria-label="Add article"
          >
            <FileText size={20} className="text-emerald-500 flex-shrink-0" />
            <span className="hidden sm:inline">Article</span>
          </button>
          <button
            onClick={() => setIsPollModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
            aria-label="Add poll"
          >
            <CheckCircle size={20} className="text-amber-500 flex-shrink-0" />
            <span className="hidden sm:inline">Poll</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-gray-50 rounded-lg transition-colors duration-200 ease-in-out cursor-pointer"
            aria-label="Add event"
          >
            <Calendar size={20} className="text-red-500 flex-shrink-0" />
            <span className="hidden sm:inline">Event</span>
          </button>
        </div>
        <button
          onClick={() => setIsCreatePostModalOpen(true)}
          className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-transform-shadow duration-200 ease-in-out shadow-sm hover:-translate-y-0.5 hover:shadow-lg ml-2"
          aria-label="Create post"
        >
          Post
        </button>
      </div>
      {isCreatePostModalOpen && (
        <CreatePostModal
          isOpen={isCreatePostModalOpen}
          onClose={() => setIsCreatePostModalOpen(false)}
          user={user}
        />
      )}
      {isPhotoModalOpen && (
        <PhotoEditorModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          user={user}
        />
      )}
      {isPollModalOpen && (
        <PollModal
          isOpen={isPollModalOpen}
          onClose={() => setIsPollModalOpen(false)}
        />
      )}
    </div>
  );
}
