'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X, Image, Video, BarChart2, Smile, MoreHorizontal } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';

// import { User, Media, Poll, Post } from '../../../types/feed';
// import { createPost } from '../../../lib/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  // user: User;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [postContent, setPostContent] = useState('');
  // const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  // const [poll, setPoll] = useState<Poll | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showPostSettings, setShowPostSettings] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [audienceType, setAudienceType] = useState<'anyone' | 'connections'>('anyone');
  const [commentControl, setCommentControl] = useState<'anyone' | 'connections' | 'nobody'>('anyone');
  const [brandPartnership, setBrandPartnership] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // const { mutate: submitPost } = useMutation({
  //   mutationFn: createPost,
  //   onMutate: async (newPost) => {
  //     await queryClient.cancelQueries({ queryKey: ['feed', user.id] });
  //     const previousFeed = queryClient.getQueryData(['feed', user.id]);
  //     queryClient.setQueryData(['feed', user.id], (old: any) => ({
  //       ...old,
  //       pages: [
  //         {
  //           posts: [
  //             {
  //               ...newPost,
  //               id: Date.now(),
  //               userId: user.id,
  //               userName: user.name,
  //               userAvatar: user.avatar,
  //               createdAt: new Date().toISOString(),
  //               likes: 0,
  //               comments: 0,
  //             },
  //             ...old.pages[0].posts,
  //           ],
  //           nextCursor: old.pages[0].nextCursor,
  //         },
  //         ...old.pages.slice(1),
  //       ],
  //     }));
  //     return { previousFeed };
  //   },
  //   onError: (err, _, context) => {
  //     queryClient.setQueryData(['feed', user.id], context?.previousFeed);
  //     setError('Failed to post. Please try again.');
  //     setIsPosting(false);
  //     setTimeout(() => setError(null), 3000);
  //   },
  //   onSuccess: () => {
  //     setShowSuccess(true);
  //     setTimeout(() => {
  //       setShowSuccess(false);
  //       onClose();
  //       setPostContent('');
  //       setSelectedMedia([]);
  //       setPoll(null);
  //       setAudienceType('anyone');
  //       setCommentControl('anyone');
  //       setBrandPartnership(false);
  //     }, 2000);
  //   },
  // });

  const debouncedSetPostContent = useCallback(
    debounce((value: string) => {
      setPostContent(value);
    }, 300),
    []
  );

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
  //   const files = Array.from(event.target.files || []);
  //   if (type === 'image' && files.length > 5 - selectedMedia.length) {
  //     setError('Maximum 5 images allowed.');
  //     setTimeout(() => setError(null), 3000);
  //     return;
  //   }
  //   if (type === 'video' && (files.length > 1 || selectedMedia.length > 0)) {
  //     setError('Only one video or up to 5 images allowed.');
  //     setTimeout(() => setError(null), 3000);
  //     return;
  //   }
  //   const validFiles = files.filter((file) => {
  //     const isValidType =
  //       type === 'image'
  //         ? ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
  //         : ['video/mp4', 'video/webm'].includes(file.type);
  //     const isValidSize = file.size <= 10 * 1024 * 1024;
  //     if (!isValidType) setError(`File ${file.name} is not a supported ${type} type.`);
  //     if (!isValidSize) setError(`File ${file.name} exceeds 10MB size limit.`);
  //     return isValidType && isValidSize;
  //   });
  //   if (validFiles.length > 0) {
  //     setShowPhotoEditor(true);
  //     setSelectedMedia(
  //       validFiles.map((file) => ({
  //         id: Date.now() + Math.random(),
  //         type,
  //         url: URL.createObjectURL(file),
  //         altText: '',
  //         taggedUsers: [],
  //       }))
  //     );
  //   }
  //   if (error) setTimeout(() => setError(null), 3000);
  // };

  // const handlePost = async () => {
  //   if (!postContent.trim() && selectedMedia.length === 0 && !poll) return;
  //   setIsPosting(true);
  //   const newPost: Post = {
  //     id: 0,
  //     userId: user.id,
  //     userName: user.name,
  //     userAvatar: user.avatar,
  //     content: postContent.trim(),
  //     media: selectedMedia,
  //     poll,
  //     audience: audienceType,
  //     commentControl,
  //     brandPartnership,
  //     createdAt: new Date().toISOString(),
  //     likes: 0,
  //     comments: 0,
  //   };
  //   // submitPost(newPost);
  // };

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img
                // src={user.avatar}
                // alt={`${user.name}'s Avatar`}
                className="w-12 h-12 rounded-full object-cover"
                aria-label="User avatar"
              />
              <div>
                <h3 className="font-semibold text-slate-800">jflaksf</h3>
                <button
                  onClick={() => setShowPostSettings(true)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="Select post audience"
                >
                  <span>Post to {audienceType === 'anyone' ? 'Anyone' : 'Connections only'}</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
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
              onChange={(e) => debouncedSetPostContent(e.target.value)}
              placeholder="What do you want to talk about?"
              className="w-full h-48 text-lg placeholder-gray-400 border-none outline-none resize-none font-light"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              aria-label="Post content input"
            />
            {/* {selectedMedia.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedMedia.map((media) => (
                  <div key={media.id} className="relative bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {media.type === 'image' ? (
                        <img src={media.url} alt={media.altText || 'Selected media'} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <video src={media.url} className="w-12 h-12 object-cover rounded" aria-label="Selected video" />
                      )}
                      <div>
                        <div className="font-medium text-sm">{media.type === 'image' ? 'Image' : 'Video'}</div>
                        <div className="text-xs text-gray-600">{media.taggedUsers?.length} tagged users</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMedia((prev) => prev.filter((m) => m.id !== media.id))}
                      className="p-1 hover:bg-gray-200 rounded-full"
                      aria-label={`Remove ${media.type}`}
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            )} */}
            {/* {poll && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-slate-700">{poll.question}</p>
                <div className="mt-2 space-y-2">
                  {poll.options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <input type="radio" disabled className="text-violet-500" aria-label={`Poll option: ${option.text}`} />
                      <span className="text-sm text-slate-600">{option.text}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Poll ends in {poll.durationDays} days</p>
              </div>
            )} */}
          </div>
          <div className="px-6 pb-4">
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                // onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm"
                // onChange={(e) => handleFileUpload(e, 'video')}
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
                aria-label="Add video"
              >
                <Video size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => setShowPollModal(true)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Create a poll"
              >
                <BarChart2 size={20} className="text-gray-600" />
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
              <span className="text-sm text-gray-500">{postContent.length}/280</span>
            </div>
            <button
              // onClick={handlePost}
              // disabled={(!postContent.trim() && selectedMedia.length === 0 && !poll) || isPosting}
              className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 ${
               true
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
      {/* {showPostSettings && (
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
      {showPhotoEditor && (
        <PhotoEditorModal
          isOpen={showPhotoEditor}
          onClose={() => setShowPhotoEditor(false)}
          user={user}
          initialMedia={selectedMedia}
          onSave={(media) => {
            setSelectedMedia(media);
            setShowPhotoEditor(false);
          }}
        />
      )}
      {showPollModal && (
        <PollModal
          isOpen={showPollModal}
          onClose={() => setShowPollModal(false)}
          onSave={(newPoll) => {
            setPoll(newPoll);
            setShowPollModal(false);
          }}
        />
      )} */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-70 flex items-center space-x-2">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-500 text-sm">✓</span>
          </div>
          <span>Post shared successfully!</span>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-70 flex items-center space-x-2">
          <span>{error}</span>
        </div>
      )}
    </>
  );
}