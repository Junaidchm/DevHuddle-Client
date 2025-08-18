"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Video, Type, Upload } from "lucide-react";
import EditorModal from "./EditorModal";
import { IconButton } from "./IconButton";

interface VideoData {
  id: number;
  file: File;
  preview: string;
  name: string;
  caption?: string;
  thumbnail?: string;
}

interface VideoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoEditorModal({
  isOpen,
  onClose,
}: VideoEditorModalProps) {
  const [selectedVideos, setSelectedVideos] = useState<VideoData[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCaptionInput, setShowCaptionInput] = useState(false);
  const [captionText, setCaptionText] = useState("");
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      const isValidType = [
        "video/mp4",
        "video/webm",
        "video/quicktime",
      ].includes(file.type);
      const isValidSize = file.size <= 100 * 1024 * 1024; // 100MB limit
      if (!isValidType)
        console.warn(`File ${file.name} is not a supported video type.`);
      if (!isValidSize)
        console.warn(`File ${file.name} exceeds 100MB size limit.`);
      return isValidType && isValidSize;
    });

    const newVideos = validFiles.map(
      (file, index) =>
        new Promise<VideoData>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve({
                id: Date.now() + index,
                file,
                preview: e.target.result as string,
                name: file.name,
              });
            } else {
              reject(new Error(`Failed to read file: ${file.name}`));
            }
          };
          reader.onerror = () =>
            reject(new Error(`Error reading file: ${file.name}`));
          reader.readAsDataURL(file);
        })
    );

    try {
      const videos = await Promise.all(newVideos);
      setSelectedVideos((prev) => [...prev, ...videos]);
      if (selectedVideos.length === 0 && videos.length > 0) {
        setCurrentVideoIndex(0);
      }
    } catch (error) {
      console.error("Error processing videos:", error);
    }
  };

  const removeVideo = (videoId: number) => {
    const newVideos = selectedVideos.filter((vid) => vid.id !== videoId);
    setSelectedVideos(newVideos);
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
      const updatedVideos = [...selectedVideos];
      updatedVideos[currentVideoIndex] = {
        ...updatedVideos[currentVideoIndex],
        caption: captionText,
      };
      setSelectedVideos(updatedVideos);
      setShowCaptionInput(false);
    }
  };

  const handleThumbnailSelect = () => {
    if (videoRef.current && selectedVideos[currentVideoIndex]) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL("image/jpeg");
        const updatedVideos = [...selectedVideos];
        updatedVideos[currentVideoIndex] = {
          ...updatedVideos[currentVideoIndex],
          thumbnail,
        };
        setSelectedVideos(updatedVideos);
        setShowThumbnailSelector(false);
      }
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
        <div className="p-6 flex gap-6 h-[calc(85vh-120px)]">
          <div className="flex-1 flex flex-col">
            {selectedVideos.length > 0 ? (
              <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={selectedVideos[currentVideoIndex]?.preview}
                  controls
                  className="w-full h-full object-contain rounded-lg"
                  onTimeUpdate={() => {
                    if (showThumbnailSelector && videoRef.current) {
                      videoRef.current.currentTime = videoRef.current.duration * 0.5; // Set to middle frame for thumbnail
                    }
                  }}
                />
                {selectedVideos[currentVideoIndex]?.thumbnail && (
                  <img
                    src={selectedVideos[currentVideoIndex].thumbnail}
                    alt="Thumbnail preview"
                    className="absolute top-4 left-4 w-16 h-16 object-cover rounded-lg border border-gray-300"
                  />
                )}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-all duration-200"
              >
                <div className="text-center">
                  <Video size={64} className="text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium text-lg">Click to upload videos</p>
                  <p className="text-slate-400 text-sm mt-2">MP4, WebM, MOV up to 100MB each</p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCaptionInput(true)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  disabled={selectedVideos.length === 0}
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
                      onClick={() => setShowCaptionInput(false)}
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
                  disabled={selectedVideos.length === 0}
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
                  onClick={() => selectedVideos.length > 0 && removeVideo(selectedVideos[currentVideoIndex].id)}
                  className="p-3 hover:bg-red-100 rounded-full transition-colors duration-200"
                  disabled={selectedVideos.length === 0}
                  aria-label="Delete video"
                >
                  <X size={20} className="text-red-500" />
                </button>
              </div>
              <button
                onClick={onClose}
                className="bg-gradient-to-br from-violet-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                disabled={selectedVideos.length === 0}
                aria-label={`Done editing, ${selectedVideos.length} videos`}
              >
                Done ({selectedVideos.length})
              </button>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Pro tips:</span> Add captions to make your videos accessible, select a thumbnail for better previews, and upload multiple videos to edit in sequence.
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
                    src={video.preview}
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

  // return (
  //   <EditorModal
  //     IconButtonAction={onClose}
  //     title="Video Editor"
  //     ariaLabel="Editor modal"
  //   >
  //     <>
  //     </>
  //   </EditorModal>
  // );
}
