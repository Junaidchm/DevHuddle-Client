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

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const previewMedia = project.media.find((m) => m.isPreview) || project.media[0];

  // Helper function to get absolute image URL
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("https")) return url;
    if (url.startsWith("/")) return `${process.env.NEXT_PUBLIC_IMAGE_PATH || ""}${url}`;
    return url;
  };

  // Helper function to get author avatar URL
  const getAuthorAvatarUrl = (avatar: string | undefined): string => {
    if (!avatar) return PROFILE_DEFAULT_URL;
    if (avatar.startsWith("http") || avatar.startsWith("https")) return avatar;
    const imagePath = process.env.NEXT_PUBLIC_IMAGE_PATH || "";
    const cleanImagePath = imagePath.endsWith("/") ? imagePath.slice(0, -1) : imagePath;
    const cleanAvatar = avatar.startsWith("/") ? avatar.slice(1) : avatar;
    return cleanImagePath ? `${cleanImagePath}/${cleanAvatar}` : `/${cleanAvatar}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group h-full flex flex-col border-border/60">
      <Link href={`/projects/${project.id}`} className="block flex-1 flex flex-col">
        {/* Preview Image */}
        <div className="relative w-full h-48 bg-muted overflow-hidden">
        {previewMedia ? (
             <Image
              src={getImageUrl(previewMedia.thumbnailUrl || previewMedia.url)}
              alt={project.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized={previewMedia.url?.includes("s3") || previewMedia.url?.includes("r2")}
            />
        ) : (
            <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                No Preview
            </div>
        )}
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
              {project.techStack.slice(0, 3).map((tech) => (
                <Badge 
                    key={tech} 
                    variant="secondary" 
                    className="font-normal text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                >
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-muted-foreground">
                  +{project.techStack.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
         
        <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-border/40 mt-auto bg-muted/5">
             {/* Author */}
            <div className="flex items-center gap-2 py-3">
                 <Avatar className="w-6 h-6 border border-border">
                    <AvatarImage src={getAuthorAvatarUrl(project.author.avatar)} alt={project.author.name} className="object-cover" />
                    <AvatarFallback>{project.author.name.charAt(0)}</AvatarFallback>
                 </Avatar>
                <div className="flex flex-col">
                     <span className="text-xs font-medium leading-none text-foreground">{project.author.name}</span>
                </div>
            </div>

            {/* Engagement Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Heart
                        className={`w-3.5 h-3.5 ${
                        project.engagement.isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                    />
                    <span>{project.engagement.likesCount}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{project.engagement.viewsCount}</span>
                </div>
                 {project.demoUrl && (
                     <div className="flex items-center gap-1 text-primary hover:underline cursor-pointer ml-1" 
                        onClick={(e) => {
                             e.preventDefault();
                             e.stopPropagation();
                             window.open(project.demoUrl, "_blank", "noopener,noreferrer");
                        }}
                     >
                         <ExternalLink className="w-3 h-3" />
                     </div>
                 )}
            </div>
        </CardFooter>
      </Link>
    </Card>
  );
}

