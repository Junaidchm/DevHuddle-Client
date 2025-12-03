"use client";

import { Project } from "@/src/services/api/project.service";
import { Heart, Share2, MessageCircle, Flag } from "lucide-react";
import { useState } from "react";
import CommentSection from "../feed/feedEditor/CommentSection";
import ShareProjectModal from "./ShareProjectModal";
import ReportProjectModal from "./ReportProjectModal";

interface ProjectEngagementProps {
  project: Project;
  onLike: () => void;
  onShare: () => void;
  isLiking: boolean;
}

export default function ProjectEngagement({
  project,
  onLike,
  onShare,
  isLiking,
}: ProjectEngagementProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleReportClick = () => {
    setShowReportModal(true);
  };

  return (
    <>
      <div>
        {/* Engagement Buttons */}
        <div className="flex items-center justify-between border-t border-b py-4">
          <button
            onClick={onLike}
            disabled={isLiking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              project.engagement.isLiked
                ? "text-red-600 bg-red-50"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                project.engagement.isLiked ? "fill-current" : ""
              }`}
            />
            <span className="font-medium">{project.engagement.likesCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">
              {project.engagement.commentsCount}
            </span>
          </button>

          <button
            onClick={handleShareClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">{project.engagement.sharesCount}</span>
          </button>

          <button
            onClick={handleReportClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4">
            <CommentSection
              postId={project.id}
              postAuthorId={project.userId}
              commentsCount={project.engagement.commentsCount}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ShareProjectModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={project.id}
        projectTitle={project.title}
      />
      <ReportProjectModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        projectId={project.id}
      />
    </>
  );
}

