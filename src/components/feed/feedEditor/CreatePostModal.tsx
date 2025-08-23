"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Image,
  Video,
  Smile,
  MoreHorizontal,
  BarChart2,
} from "lucide-react";
import PostSettingsModal from "./PostSettingsModal";
import { ImageData, User, Media, Poll } from "@/src/app/types/feed";
import { z } from "zod";
import dynamic from "next/dynamic";
import PhotoEditorModal from "./PhotoEditorModal";
import { useMedia } from "@/src/contexts/MediaContext";
import PollModal from "./PollModal";
import { useSubmitPostMutation } from "../mutations/useSubmitPostMutation";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import toast from "react-hot-toast";

const LazyPostSettingsModal = dynamic(() => import('./PostSettingsModal'), { ssr: false });
const LazyPhotoEditorModal = dynamic(() => import('./PhotoEditorModal'), { ssr: false });
const LazyPollModal = dynamic(() => import('./PollModal'), { ssr: false });
const LazyVideoEditorModal = dynamic(() => import('./VideoEdit'), { ssr: false });

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  user,
}: CreatePostModalProps) {

  const [postContent, setPostContent] = useState("");
  const [poll, setPoll] = useState<Poll | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [showPostSettings, setShowPostSettings] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [audienceType, setAudienceType] = useState<
   "PUBLIC" | "VISIBILITY_CONNECTIONS" 
  >("PUBLIC");
  const [commentControl, setCommentControl] = useState<
   "ANYONE" | "CONNECTIONS" | "NOBODY"
  >("ANYONE");
  const [showSuccess, setShowSuccess] = useState(false);
  const { media } = useMedia();
  const [error, setError] = useState("");

  const userId = useSelector(
    (state: RootState) => state?.user?.user?.id
  ) as string;
  const mutation = useSubmitPostMutation({ userId });


  function onSubmit() {

    if(!postContent.trim() &&  media.length == 0 && !poll ) {
      toast.error('Please add content, media, or a poll.')
    }

    

    setIsPosting(true);
    
  }

  if (!isOpen) return null;

  // const rewriteWithAI = () => {
  //   const aiSuggestions = [
  //     "🚀 Excited to share my latest project! Building scalable web applications with React and Next.js has been an incredible journey. Always learning, always growing! #WebDev #React #NextJS",
  //     "💡 Just discovered an amazing new approach to state management in React. The developer community never fails to inspire me with innovative solutions! #ReactJS #StateManagement #Innovation",
  //     "🎯 Another day, another challenge conquered! Love how every coding problem teaches us something new. What's the most interesting bug you've solved recently? #CodingLife #ProblemSolving",
  //   ];
  //   const randomSuggestion =
  //     aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
  //   setPostContent(randomSuggestion);
  // };

  return (
    <>
      <div className="fixed inset-0 bg-[#000000aa] flex items-center justify-center z-50 p-4">

        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
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
                <h1>{postContent}</h1>
                <button
                  onClick={() => setShowPostSettings(true)}
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  aria-label="Select post audience"
                >
                  <span>
                    Post to{" "}
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
          <div className="p-6 flex-1 overflow-y-auto">
            <textarea
              name="content"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What do you want to talk about?"
              className="w-full h-48 text-lg placeholder-gray-400 border-none outline-none resize-none font-light"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
              aria-label="Post content input"
            />
            {media.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                {media.map((media) => (
                  <div
                    key={media.id}
                    className="relative bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      {media.type === "image" ? (
                        <img
                          src={media.url}
                          alt={media.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <video
                          src={media.url}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm">{media.name}</div>
                        {/* <div className="text-xs text-gray-600">
                      {media.}
                    </div> */}
                      </div>
                    </div>
                    <button
                      className="p-1 hover:bg-gray-200 rounded-full"
                      aria-label={`Remove ${media.name}`}
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                ))}
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
                // onClick={() => videoInputRef.current?.click()}
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
                onClick={() => setShowPhotoEditor(true)}
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
          <div className="px-6 pb-4">
            <button
              // onClick={rewriteWithAI}
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
              onClick={onSubmit}
              className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 ${
                true
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              aria-label="Submit post"
            >
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>
      </div>
      {showPostSettings && (
        <LazyPostSettingsModal
          isOpen={showPostSettings}
          onClose={() => setShowPostSettings(false)}
          audienceType={audienceType}
          setAudienceType={setAudienceType}
          commentControl={commentControl}
          setCommentControl={setCommentControl}
        />
      )}
      {showPhotoEditor && (
        <LazyPhotoEditorModal
          isOpen={showPhotoEditor}
          onClose={() => setShowPhotoEditor(false)}
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
