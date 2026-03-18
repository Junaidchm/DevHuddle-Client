"use client";

import Link from "next/link";
import Image from "next/image";
import { Project } from "@/src/services/api/project.service";
import { Heart, Eye, ExternalLink } from "lucide-react";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Card, CardContent, CardFooter, CardHeader } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { getMediaUrl } from "@/src/utils/media";
import { useWebSocket } from "@/src/contexts/WebSocketContext";
import { useEffect, useMemo } from "react";
import { usePostLikeCountQuery } from "../feed/queries/useGetPostLikes";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const previewMedia = project.media.find((m) => m.isPreview) || project.media[0];
  const { joinPostRoom, leavePostRoom } = useWebSocket();

  // Reactively fetch like count
  const { data: likeCountData } = usePostLikeCountQuery(project.id);

  const engagement = useMemo(() => {
    const reactiveLikesCount = likeCountData?.success ? likeCountData.count : undefined;
    return {
      ...project.engagement,
      likesCount: reactiveLikesCount ?? project.engagement.likesCount,
    };
  }, [project.engagement, likeCountData]);

  // Join project-specific WebSocket room for real-time engagement updates
  // Note: Project rooms use the same joinPostRoom logic as they are also "entities"
  useEffect(() => {
    if (project.id) {
      console.log(`[WebSocket] 🛠️ Entering room for project: ${project.id}`);
      joinPostRoom(project.id);
      return () => {
        console.log(`[WebSocket] 🚪 Leaving room for project: ${project.id}`);
        leavePostRoom(project.id);
      };
    }
  }, [project.id, joinPostRoom, leavePostRoom]);

  return (
    <Card className="card-base overflow-hidden hover:shadow-md transition-shadow duration-300 group flex flex-col h-full border-none shadow-xs">
      <Link href={`/projects/${project.id}`} className="flex flex-col h-full">
        {/* Preview Image - Clean aspect ratio */}
        <div className="relative w-full aspect-[16/9] bg-muted overflow-hidden border-b border-border/40">
        {previewMedia ? (
             <Image
              src={getMediaUrl(previewMedia.thumbnailUrl || previewMedia.url)}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized={previewMedia.url?.includes("s3") || previewMedia.url?.includes("r2")}
            />
        ) : (
            <div className="flex items-center justify-center h-full bg-muted/30 text-muted-foreground/40 italic text-xs">
                No Preview Available
            </div>
        )}
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Author info at the top for professional look */}
          <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-6 h-6 border border-border/60">
                <AvatarImage src={getMediaUrl(project.author.avatar) || PROFILE_DEFAULT_URL} alt={project.author.name} className="object-cover" />
                <AvatarFallback className="text-[10px]">{project.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-[11px] font-semibold text-foreground/80 truncate">
                {project.author.name}
              </span>
          </div>

          <h3 className="text-base font-bold text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors leading-tight">
            {project.title}
          </h3>

          <p className="text-muted-foreground text-[13px] line-clamp-2 leading-snug mb-4 flex-1">
            {project.description}
          </p>

          {/* Clean Tech Stack Tags */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {project.techStack.slice(0, 2).map((tech) => (
                <span 
                    key={tech} 
                    className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 2 && (
                <span className="text-[10px] text-muted-foreground/60 font-medium px-1">
                  +{project.techStack.length - 2} more
                </span>
              )}
            </div>
          )}
        </CardContent>
         
        <CardFooter className="px-4 py-3 flex items-center justify-between border-t border-border/40 bg-muted/5">
            {/* Engagement Stats in minimalist style */}
            <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground/80">
                <div className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer">
                    <Heart
                        className={`w-3.5 h-3.5 ${
                        project.engagement.isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                    />
                    <span>{engagement.likesCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground/60" />
                    <span>{project.engagement.viewsCount} views</span>
                </div>
            </div>

            {project.demoUrl && (
                <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-7 px-2 text-primary hover:text-brand-blue-hover hover:bg-primary/5 text-[11px] font-semibold"
                   onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(project.demoUrl, "_blank", "noopener,noreferrer");
                   }}
                >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Demo
                </Button>
            )}
        </CardFooter>
      </Link>
    </Card>
  );
}

