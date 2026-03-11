import { Project } from "@/src/services/api/project.service";
import { Heart, Share2, MessageCircle, Flag } from "lucide-react";
import { useState } from "react";
import CommentSection from "./comments/CommentSection";
import ShareProjectModal from "./modals/ShareProjectModal";
import ReportProjectModal from "./modals/ReportProjectModal";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

interface ProjectEngagementProps {
  project: Project;
  onLike: () => void;
  isLiking: boolean;
}

export default function ProjectEngagement({
  project,
  onLike,
  isLiking,
}: ProjectEngagementProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Engagement Action Bar */}
        <div className="flex items-center justify-between py-2 border-y border-border/60">
          <div className="flex items-center gap-1 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              disabled={isLiking}
              className={cn(
                "group flex items-center gap-2 px-3 py-2",
                project.engagement.isLiked 
                  ? "text-red-500 hover:text-red-600 hover:bg-red-50" 
                  : "text-muted-foreground"
              )}
            >
              <Heart
                className={cn(
                  "w-5 h-5 transition-all",
                  project.engagement.isLiked ? "fill-current scale-110" : "group-hover:scale-110"
                )}
              />
              <span className="font-semibold">{project.engagement.likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "group flex items-center gap-2 px-3 py-2",
                showComments ? "text-primary bg-primary/5" : "text-muted-foreground"
              )}
            >
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{project.engagement.commentsCount}</span>
            </Button>

            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="group flex items-center gap-2 px-3 py-2 text-muted-foreground"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{project.engagement.sharesCount}</span>
            </Button> */}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowReportModal(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          >
            <Flag className="w-4 h-4" />
          </Button>
        </div>

        {/* Views Display (Owners Only) */}
        {project.engagement.viewsCount > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-2">
            <span className="font-medium">{project.engagement.viewsCount} total views</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Visible to you as the owner</span>
          </div>
        )}

        {/* Collapsible Comments Section */}
        {showComments && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <CommentSection
              projectId={project.id}
              projectAuthorId={project.author.id}
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
        targetId={project.id}
      />
    </>
  );
}

