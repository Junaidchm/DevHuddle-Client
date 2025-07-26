'use client';

import React, { useState, useRef } from 'react';
import { X, Image, Video, Calendar, Smile, MoreHorizontal } from 'lucide-react';
import PostSettingsModal from './PostSettingsModal';
import { User } from '@/src/app/types/feed';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

interface Media {
  id: number;
  file: File;
  type: 'image' | 'video';
  url: string;
  name: string;
}

export default function CreatePostModal({ isOpen, onClose, user }: CreatePostModalProps) {
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showPostSettings, setShowPostSettings] = useState(false);
  const [audienceType, setAudienceType] = useState('anyone');
  const [commentControl, setCommentControl] = useState('anyone');
  const [brandPartnership, setBrandPartnership] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = Array.from(event.target.files || []);
    const newMedia = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      type,
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setSelectedMedia((prev) => [...prev, ...newMedia]);
  };

  const removeMedia = (id: number) => {
    setSelectedMedia((prev) => prev.filter((media) => media.id !== id));
  };

  const handlePost = async () => {
    if (!postContent.trim() && selectedMedia.length === 0) return;
    setIsPosting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsPosting(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
      setPostContent('');
      setSelectedMedia([]);
    }, 2000);
  };

  const rewriteWithAI = () => {
    const aiSuggestions = [
      "🚀 Excited to share my latest project! Building scalable web applications with React and Next.js has been an incredible journey. Always learning, always growing! #WebDev #React #NextJS",
      "💡 Just discovered an amazing new approach to state management in React. The developer community never fails to inspire me with innovative solutions! #ReactJS #StateManagement #Innovation",
      "🎯 Another day, another challenge conquered! Love how every coding problem teaches us something new. What's the most interesting bug you've solved recently? #CodingLife #ProblemSolving",
    ];
    const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setPostContent(randomSuggestion);
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar}
                alt={`${user.name}'s Avatar`}
                className="w-12 h-12 rounded-full object-cover"
                aria-label="User avatar"
              />
              <div>
                <h3 className="font-semibold text-slate-800">{user.name}</h3>
                <button
                  onClick={() => setShowPostSettings(true)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="Select post audience"
                >
                  <span>Post to {audienceType === 'anyone' ? 'Anyone' : 'Connections only'}</span>
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
          <div className="p-6">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What do you want to talk about?"
              className="w-full h-48 text-lg placeholder-gray-400 border-none outline-none resize-none font-light"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              aria-label="Post content input"
            />
            {selectedMedia.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedMedia.map((media) => (
                  <div key={media.id} className="relative bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={media.url} alt={media.name} className="w-12 h-12 object-cover rounded" />
                      <div>
                        <div className="font-medium text-sm">{media.name}</div>
                        <div className="text-xs text-gray-600">{media.type}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMedia(media.id)}
                      className="p-1 hover:bg-gray-200 rounded-full"
                      aria-label={`Remove ${media.name}`}
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video')}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add photos"
              >
                <Image size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add videos"
              >
                <Video size={20} className="text-gray-600" />
              </button>
              <button
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Create an event"
              >
                <Calendar size={20} className="text-gray-600" />
              </button>
              <button
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Add emoji"
              >
                <Smile size={20} className="text-gray-600" />
              </button>
              <button
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
          <div className="px-6 pb-4">
            <button
              onClick={rewriteWithAI}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              aria-label="Rewrite with AI"
            >
              <span className="text-orange-500 font-bold">✨</span>
              <span className="text-gray-700 font-medium">Rewrite with AI</span>
            </button>
          </div>
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">⏰</span>
            </div>
            <button
              onClick={handlePost}
              disabled={(!postContent.trim() && selectedMedia.length === 0) || isPosting}
              className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 ${
                (postContent.trim() || selectedMedia.length > 0) && !isPosting
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Submit post"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
      {showPostSettings && (
        <PostSettingsModal
          isOpen={showPostSettings}
          onClose={() => setShowPostSettings(false)}
          audienceType={audienceType}
          setAudienceType={setAudienceType}
          commentControl={commentControl}
          setCommentControl={setCommentControl}
          brandPartnership={brandPartnership}
          setBrandPartnership={setBrandPartnership}
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