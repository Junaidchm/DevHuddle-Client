"use client";

import { Project } from "@/src/services/api/project.service";
import { Heart, Share2, Eye, ExternalLink, Github, Flag, Plus } from "lucide-react";
import ProjectEngagement from "./ProjectEngagement";
import ProjectMediaGallery from "./ProjectMediaGallery";
import CommentSection from "./comments/CommentSection";
import { useLikeProjectMutation } from "./hooks/useLikeProjectMutation";
import { trackProjectView } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { getMediaUrl } from "@/src/utils/media";
import { useWebSocket } from "@/src/contexts/WebSocketContext";

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const authHeaders = useAuthHeaders();
  const { like, unlike, isLiking, isUnliking } = useLikeProjectMutation(
    project.id
  );


  const { joinPostRoom, leavePostRoom } = useWebSocket();

  // Track view on mount
  useEffect(() => {
    trackProjectView(project.id, authHeaders).catch(() => {
      // Silent fail for view tracking
    });
  }, [project.id, authHeaders]);

  // Join project-specific WebSocket room for real-time engagement updates
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

  const handleLike = () => {
    if (project.engagement.isLiked) {
      unlike();
    } else {
      like();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Main Content Card */}
      <Card className="card-base overflow-hidden border-none shadow-sm">
        {/* Project Header */}
        <div className="p-6 md:p-8 bg-card">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
               <div className="space-y-4">
                  <div className="space-y-1">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                          <Plus className="w-3 h-3" />
                          Project Overview
                      </div>
                      <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                        {project.title}
                      </h1>
                  </div>
                  
                  {/* Author Meta */}
                  <div className="flex items-center gap-3 py-1">
                      <Avatar className="w-11 h-11 border border-border/80 shadow-xs">
                           <AvatarImage src={getMediaUrl(project.author.avatar) || PROFILE_DEFAULT_URL} alt={project.author.name} className="object-cover" />
                          <AvatarFallback className="bg-muted text-muted-foreground">{project.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                          <Link href={`/profile/${project.author.username}`} className="font-bold text-foreground hover:text-primary transition-colors text-base">
                              {project.author.name}
                          </Link>
                          <p className="text-sm text-muted-foreground font-medium italic">@{project.author.username}</p>
                      </div>
                  </div>
               </div>

               {/* Action Links */}
              <div className="flex flex-wrap gap-3 self-start">
              {project.repositoryUrls.map((url, index) => (
                  <Button key={index} variant="outline" size="sm" className="h-10 px-4 font-semibold border-border/60 hover:bg-muted text-foreground/80" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          {project.repositoryUrls.length > 1 ? `Repo ${index + 1}` : "View Repository"}
                      </a>
                  </Button>
              ))}
              {project.demoUrl && (
                   <Button variant="default" size="sm" className="h-10 px-6 font-bold bg-primary hover:bg-brand-blue-hover shadow-sm" asChild>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Experience
                      </a>
                  </Button>
              )}
              </div>
          </div>
        </div>


        {/* Media Gallery with clean border */}
        {project.media.length > 0 && (
          <div className="border-b border-border/40 min-h-[400px]">
            <ProjectMediaGallery media={project.media} />
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left: About/Description */}
            <div className="lg:col-span-2 p-6 md:p-8 space-y-6">
                <div>
                    <h2 className="text-lg font-bold text-foreground mb-4 inline-flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        About the Project
                    </h2>
                    <div
                      className="prose prose-slate max-w-none text-muted-foreground text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                </div>
            </div>

            {/* Right: Sidebar Meta */}
            <div className="p-6 md:p-8 bg-muted/5 border-l border-border/40 space-y-8">
                {project.techStack.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Technology Stack</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {project.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="px-3 py-1 bg-background text-foreground font-semibold border border-border/60 rounded-md">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Tags & Categorization</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-sm font-medium text-primary hover:underline cursor-pointer">
                          #{tag.replace(/\s+/g, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                        <span>Project ID:</span>
                        <code className="bg-muted px-1.5 py-0.5 rounded text-[10px]">{project.id.slice(0, 8)}...</code>
                    </div>
                </div>
            </div>
        </div>

        {/* Engagement Bar at the very bottom */}
        <div className="px-6 py-4 bg-muted/5 border-t border-border/40">
          <ProjectEngagement
            project={project}
            onLike={handleLike}
            isLiking={isLiking || isUnliking}
          />
        </div>
      </Card>

    </div>
  );
}

