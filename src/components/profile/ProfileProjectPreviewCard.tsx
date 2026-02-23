'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Project } from "@/src/services/api/project.service";
import { getMediaUrl } from "@/src/utils/media";
import { Heart, Eye } from 'lucide-react';
import { Card } from "@/src/components/ui/card";

interface ProfileProjectPreviewCardProps {
  project: Project;
}

const ProfileProjectPreviewCard = ({ project }: ProfileProjectPreviewCardProps) => {
  const previewMedia = project.media.find((m) => m.isPreview) || project.media[0];

  return (
    <Card className="border-b border-border shadow-none rounded-none first:rounded-t-lg last:rounded-b-lg last:border-0 hover:bg-muted/50 transition-colors">
      <Link href={`/projects/${project.id}`} className="block p-4">
        <div className="flex gap-4">
            
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
             {/* Title */}
            <h3 className="text-sm font-semibold text-foreground mb-1 hover:text-primary transition-colors truncate">
                {project.title}
            </h3>

            {/* Description Preview */}
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
              {project.description}
            </p>

            {/* Tech Stack & Stats */}
             <div className="flex items-center justify-between mt-2">
                {/* Tech Stack (Limit to 2) */}
                <div className="flex items-center gap-1">
                    {project.techStack.slice(0, 2).map(tech => (
                        <span key={tech} className="text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground font-medium">
                            {tech}
                        </span>
                    ))}
                    {project.techStack.length > 2 && (
                         <span className="text-[10px] text-muted-foreground pl-0.5">+{project.techStack.length - 2}</span>
                    )}
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{project.engagement?.likesCount || 0}</span>
                    </div>
                </div>
            </div>
           
          </div>

          {/* Thumbnail (Right side) */}
          <div className="shrink-0 w-24 h-16 relative rounded-md overflow-hidden bg-muted border border-border/50">
             {previewMedia ? (
                <Image
                    src={getMediaUrl(previewMedia.thumbnailUrl || previewMedia.url)}
                    alt={project.title}
                    fill
                    className="object-cover"
                />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground italic">
                    No Preview
                </div>
             )}
          </div>

        </div>
      </Link>
    </Card>
  );
};

export default ProfileProjectPreviewCard;
