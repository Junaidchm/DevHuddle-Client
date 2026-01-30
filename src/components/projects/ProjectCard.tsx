"use client";

import Link from "next/link";
import Image from "next/image";
import { Project } from "@/src/services/api/project.service";
import { Heart, Share2, Eye, ExternalLink } from "lucide-react";
import { PROFILE_DEFAULT_URL } from "@/src/constents";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const previewMedia = project.media.find((m) => m.isPreview) || project.media[0];

  // Helper function to get absolute image URL
  const getImageUrl = (url: string | undefined): string => {
    if (!url) return "";
    // If it's already an absolute URL, return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // If it's a relative path, prepend the image path
    if (url.startsWith("/")) {
      return `${process.env.NEXT_PUBLIC_IMAGE_PATH || ""}${url}`;
    }
    // Otherwise, assume it's a full URL from S3 or R2
    return url;
  };

  // Helper function to get author avatar URL
  const getAuthorAvatarUrl = (avatar: string | undefined): string => {
    if (!avatar) return PROFILE_DEFAULT_URL;
    // If it's already an absolute URL (S3, R2, etc.), return as is
    if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
      return avatar;
    }
    // If it's a relative path, prepend the image path
    const imagePath = process.env.NEXT_PUBLIC_IMAGE_PATH || "";
    // Remove trailing slash from imagePath if present
    const cleanImagePath = imagePath.endsWith("/") ? imagePath.slice(0, -1) : imagePath;
    // Remove leading slash from avatar if present
    const cleanAvatar = avatar.startsWith("/") ? avatar.slice(1) : avatar;
    // Combine without double slashes
    return cleanImagePath ? `${cleanImagePath}/${cleanAvatar}` : `/${cleanAvatar}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/projects/${project.id}`} className="block">
        {/* Preview Image */}
        {previewMedia && (
          <div className="relative w-full h-48 bg-gray-100">
            <Image
              src={getImageUrl(previewMedia.thumbnailUrl || previewMedia.url)}
              alt={project.title}
              fill
              className="object-cover"
              unoptimized={previewMedia.url?.includes("s3") || previewMedia.url?.includes("r2")}
            />
          </div>
        )}

        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-semibold mb-2 line-clamp-2">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {project.description}
          </p>

          {/* Tech Stack */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.techStack.slice(0, 3).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{project.techStack.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Engagement Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Heart
                  className={`w-4 h-4 ${
                    project.engagement.isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span>{project.engagement.likesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{project.engagement.viewsCount}</span>
              </div>
            </div>

            {/* Demo Link */}
            {project.demoUrl && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(project.demoUrl, "_blank", "noopener,noreferrer");
                }}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Demo</span>
              </button>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              <Image
                src={getAuthorAvatarUrl(project.author.avatar)}
                alt={project.author.name}
                width={32}
                height={32}
                className="object-cover"
                unoptimized={true}
              />
            </div>
            <div>
              <p className="text-sm font-medium">{project.author.name}</p>
              <p className="text-xs text-gray-500">@{project.author.username}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

