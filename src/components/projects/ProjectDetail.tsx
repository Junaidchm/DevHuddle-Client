"use client";

import { Project } from "@/src/services/api/project.service";
import { Heart, Share2, Eye, ExternalLink, Github, Flag } from "lucide-react";
import ProjectEngagement from "./ProjectEngagement";
import ProjectMediaGallery from "./ProjectMediaGallery";
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

interface ProjectDetailProps {
  project: Project;
}

export default function ProjectDetail({ project }: ProjectDetailProps) {
  const authHeaders = useAuthHeaders();
  const { like, unlike, isLiking, isUnliking } = useLikeProjectMutation(
    project.id
  );


  // Track view on mount
  useEffect(() => {
    trackProjectView(project.id, authHeaders).catch(() => {
      // Silent fail for view tracking
    });
  }, [project.id, authHeaders]);

  const handleLike = () => {
    if (project.engagement.isLiked) {
      unlike();
    } else {
      like();
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
             <div>
                <h1 className="text-3xl font-bold mb-4 tracking-tight text-foreground">{project.title}</h1>
                
                {/* Author */}
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border">
                         <AvatarImage src={getMediaUrl(project.author.avatar) || PROFILE_DEFAULT_URL} alt={project.author.name} className="object-cover" />
                        <AvatarFallback>{project.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <Link href={`/profile/${project.author.username}`} className="font-medium text-foreground hover:underline">
                            {project.author.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">@{project.author.username}</p>
                    </div>
                </div>
             </div>

             {/* Links */}
            <div className="flex flex-wrap gap-2">
            {project.repositoryUrls.map((url, index) => (
                <Button key={index} variant="outline" size="sm" asChild>
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <Github className="w-4 h-4 mr-2" />
                        Repository {project.repositoryUrls.length > 1 ? index + 1 : ""}
                    </a>
                </Button>
            ))}
            {project.demoUrl && (
                 <Button variant="default" size="sm" asChild>
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live Demo
                    </a>
                </Button>
            )}
            </div>
        </div>
      </div>

      {/* Media Gallery */}
      {project.media.length > 0 && (
        <div className="border-b border-border bg-background">
          <ProjectMediaGallery media={project.media} />
        </div>
      )}

      {/* Description */}
      <div className="p-8 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">About this Project</h2>
        <div
          className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      </div>

      {/* Tech Stack & Tags */}
      <div className="p-6 border-b border-border space-y-6">
        {project.techStack.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground uppercase tracking-wider">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {project.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-foreground uppercase tracking-wider">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="px-3 py-1">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Engagement */}
      <div className="p-6 bg-muted/5">
        <ProjectEngagement
          project={project}
          onLike={handleLike}
          onShare={() => {}}
          isLiking={isLiking || isUnliking}
        />
      </div>
    </Card>
  );
}

