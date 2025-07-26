import React, { useRef, useState } from "react";
import {
  X,
  Image,
  Video,
  Calendar,
  Smile,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { User } from "@/src/app/types/feed";

interface MainPostModalProps {
  isOpen: boolean;
  closeNormalPostModal: () => void;
  userProfile: User;
  audienceType: string;
  commentControl?: string;
  setShowPostSettings?: (value: boolean) => void;
  setShowSuccess?: (value: boolean) => void;
  onPost?: (post: any) => void;
}

const MainPostModal: React.FC<MainPostModalProps> = ({
  isOpen,
  closeNormalPostModal,
  userProfile,
  audienceType,
  commentControl,
  setShowPostSettings,
  setShowSuccess,
  onPost,
}) => {
  const [postContent, setPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const closeModal = () => {
    closeNormalPostModal();
    setPostContent("");
    setSelectedMedia([]);
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newPost = {
      id: Date.now(),
      content: postContent,
      media: selectedMedia,
      audience: audienceType,
      commentControl,
      timestamp: new Date(),
      author: userProfile,
      likes: 0,
      comments: 0,
    };

    // onPost(newPost);
    setIsPosting(false);
    // setShowSuccess(true);

     setTimeout(() => {
        // setShowSuccess(false);
        closeModal();
      }, 2000);
  };

  const rewriteWithAI = () => {
    const aiSuggestions = [
      "🚀 Excited to share my latest project! Building scalable web applications with React and Next.js has been an incredible journey. Always learning, always growing! #WebDev #React #NextJS",
      "💡 Just discovered an amazing new approach to state management in React. The developer community never fails to inspire me with innovative solutions! #ReactJS #StateManagement #Innovation",
      "🎯 Another day, another challenge conquered! Love how every coding problem teaches us something new. What's the most interesting bug you've solved recently? #CodingLife #ProblemSolving",
    ];
    const randomSuggestion =
      aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
    setPostContent(randomSuggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-slate-800">
                {userProfile.name}
              </h3>
              <button
                // onClick={() => setShowPostSettings(true)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <span>
                  Post to{" "}
                  {audienceType === "anyone" ? "Anyone" : "Connections only"}
                </span>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full h-48 text-lg placeholder-gray-400 border-none outline-none resize-none font-light"
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          />
          {selectedMedia.length > 0 && (
            <div className="mt-4 space-y-2">
              {selectedMedia.map((media) => (
                <div
                  key={media.id}
                  className="relative bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium text-sm">{media.name}</div>
                      <div className="text-xs text-gray-600">{media.type}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMedia(media.id)}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X size={16} className="text-gray-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Media Options */}
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, "image")}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, "video")}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add photos"
            >
              <Image size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add videos"
            >
              <Video size={20} className="text-gray-600" />
            </button>
            <button
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Create an event"
            >
              <Calendar size={20} className="text-gray-600" />
            </button>
            <button
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add emoji"
            >
              <Smile size={20} className="text-gray-600" />
            </button>
            <button
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="More options"
            >
              <MoreHorizontal size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Rewrite with AI Button */}
        <div className="px-6 pb-4">
          <button
            onClick={rewriteWithAI}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            <span className="text-orange-500 font-bold">✨</span>
            <span className="text-gray-700 font-medium">Rewrite with AI</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">⏰</span>
          </div>
          <button
            onClick={handlePost}
            disabled={
              (!postContent.trim() && selectedMedia.length === 0) || isPosting
            }
            className={`px-6 py-2 font-semibold rounded-full transition-all duration-200 ${
              (postContent.trim() || selectedMedia.length > 0) && !isPosting
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainPostModal;
