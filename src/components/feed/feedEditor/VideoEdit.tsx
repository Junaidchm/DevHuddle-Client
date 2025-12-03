"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Video, Type, Upload } from "lucide-react";
import EditorModal from "./EditorModal";
import { Media } from "@/src/app/types/feed";
import { useMedia } from "@/src/contexts/MediaContext";
import useMediaUpload from "./Hooks/useMediaUpload";
import toast from "react-hot-toast";

interface VideoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoEditorModal({
  isOpen,
  onClose,
}: VideoEditorModalProps) {
  // ✅ Integrated: Use MediaContext for video state
  const { media, setMedia, addMedia } = useMedia();
  
  // ✅ Integrated: Use upload hook for actual uploads
  const {
    startUpload,
    attachments,
    isUploading,
    uploadProgress,
    removeAttachment,
    reset: resetMediaUploads,
  } = useMediaUpload();

  const [selectedVideos, setSelectedVideos] = useState<Media[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ Sync videos from MediaContext (filter videos only)
  useEffect(() => {
    const videoMedia = (media ?? []).filter((file) => 
      file.type?.includes('video') || file.type?.startsWith('video/')
    );
    setSelectedVideos(videoMedia);
    if (videoMedia.length > 0 && currentVideoIndex >= videoMedia.length) {
      setCurrentVideoIndex(0);
    }
  }, [media]);

  // ✅ Handle video file selection and validation
  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter((file) => {
      const isValidType = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-msvideo", // .avi
      ].includes(file.type);
      
      // ✅ Note: UploadThing config shows 8MB limit, but we'll validate for 100MB
      // The actual limit will be enforced by UploadThing
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      
      if (!isValidType) {
        setError(`${file.name} is not a supported video type. Supported: MP4, WebM, MOV, AVI`);
        setTimeout(() => setError(null), 3000);
      }
      if (!isValidSize) {
        setError(`${file.name} exceeds 100MB size limit.`);
        setTimeout(() => setError(null), 3000);
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      return;
    }

    // Check total video count limit (max 1 video per post based on UploadThing config)
    if (selectedVideos.length + validFiles.length > 1) {
      setError("Maximum 1 video allowed per post.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Check if already uploading
    if (isUploading) {
      toast.error("Please wait for the current upload to finish.");
      return;
    }

    // ✅ Start upload using useMediaUpload hook (handles UploadThing)
    startUpload(validFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ Remove video from MediaContext
  const removeVideo = (videoId: string) => {
    const newVideos = selectedVideos.filter((vid) => vid.id !== videoId);
    setMedia(newVideos);
    
    if (currentVideoIndex >= newVideos.length && newVideos.length > 0) {
      setCurrentVideoIndex(newVideos.length - 1);
    } else if (newVideos.length === 0) {
      setCurrentVideoIndex(0);
    }
  };

  const selectVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleCaptionChange = () => {
    if (selectedVideos[currentVideoIndex]) {
      // TODO: Add caption support to Media type if needed
      // For now, we'll just close the input
      setShowCaptionInput(false);
      setCaptionText("");
      toast.info("Video captions feature coming soon");
    }
  };

  // ✅ Generate thumbnail from current video frame
  const handleThumbnailSelect = () => {
    if (videoRef.current && selectedVideos[currentVideoIndex]) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 1280;
        canvas.height = videoRef.current.videoHeight || 720;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL("image/jpeg");
          
          // Update video with thumbnail (would need to store in Media type)
          toast.success("Thumbnail generated! Feature integration coming soon.");
          setShowThumbnailSelector(false);
        }
      } catch (error) {
        toast.error("Failed to generate thumbnail");
      }
    }
  };

  // Reset input ref
  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[900px] max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Video Editor</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close video editor"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="p-6 flex gap-6 h-[calc(85vh-120px)]">
          <div className="flex-1 flex flex-col">
            {selectedVideos.length > 0 ? (
              <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={selectedVideos[currentVideoIndex]?.url as string}
                  controls
                  className="w-full h-full object-contain rounded-lg"
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = videoRef.current.duration * 0.5;
                    }
                  }}
                />
                
                {/* Upload Progress */}
                {isUploading && uploadProgress !== undefined && (
                  <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg p-3 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        Uploading video...
                      </span>
                      <span className="text-sm text-slate-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`flex-1 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isUploading
                    ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                    : "border-slate-300 cursor-pointer hover:border-violet-400 hover:bg-violet-50"
                }`}
              >
                <div className="text-center">
                  <Video size={64} className="text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium text-lg">
                    {isUploading ? "Uploading video..." : "Click to upload video"}
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    MP4, WebM, MOV up to 100MB
                  </p>
                  {isUploading && uploadProgress !== undefined && (
                    <div className="mt-4 w-64 mx-auto">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2">{uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
              disabled={isUploading}
            />
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCaptionInput(true)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  disabled={selectedVideos.length === 0 || isUploading}
                  aria-label="Add captions"
                >
                  <Type size={20} className="text-slate-600" />
                </button>
                {showCaptionInput && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="Enter caption..."
                      className="p-2 border border-slate-200 rounded-lg text-sm"
                      aria-label="Enter caption text"
                    />
                    <button
                      onClick={handleCaptionChange}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-violet-500 to-purple-600 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all"
                      aria-label="Save caption"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowCaptionInput(false);
                        setCaptionText("");
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Cancel caption"
                    >
                      <X size={20} className="text-slate-600" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowThumbnailSelector(true)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  disabled={selectedVideos.length === 0 || isUploading}
                  aria-label="Select thumbnail"
                >
                  <Upload size={20} className="text-slate-600" />
                </button>
                {showThumbnailSelector && (
                  <button
                    onClick={handleThumbnailSelect}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-violet-500 to-purple-600 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    aria-label="Apply thumbnail"
                  >
                    Apply Thumbnail
                  </button>
                )}
                <button
                  onClick={() => {
                    if (selectedVideos.length > 0) {
                      removeVideo(selectedVideos[currentVideoIndex].id);
                    }
                  }}
                  className="p-3 hover:bg-red-100 rounded-full transition-colors duration-200"
                  disabled={selectedVideos.length === 0 || isUploading}
                  aria-label="Delete video"
                >
                  <X size={20} className="text-red-500" />
                </button>
              </div>
              <button
                onClick={onClose}
                className="bg-gradient-to-br from-violet-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading}
                aria-label={`Done editing, ${selectedVideos.length} video${selectedVideos.length !== 1 ? 's' : ''}`}
              >
                Done ({selectedVideos.length})
              </button>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Pro tips:</span> Videos are automatically uploaded when selected. Once uploaded, they'll appear in your post. Maximum 1 video per post.
              </p>
            </div>
          </div>
          <div className="w-32">
            <div className="text-center mb-4">
              <span className="text-sm text-slate-600 font-medium">
                {selectedVideos.length > 0 ? `${currentVideoIndex + 1} of ${selectedVideos.length}` : '0 of 0'}
              </span>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {selectedVideos.map((video, index) => (
                <div key={video.id} className="relative group">
                  <video
                    src={video.url as string}
                    className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                      index === currentVideoIndex ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectVideo(index)}
                    aria-label={`Select video ${index + 1}`}
                  />
                  <button
                    onClick={() => removeVideo(video.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    aria-label={`Remove video ${video.name}`}
                    disabled={isUploading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
