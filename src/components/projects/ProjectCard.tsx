"use client";

import Link from "next/link";
import Image from "next/image";
import { Project } from "@/src/services/api/project.service";
import { Heart, Share2, Eye, ExternalLink } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const previewMedia = project.media.find((m) => m.isPreview) || project.media[0];

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {/* Preview Image */}
        {previewMedia && (
          <div className="relative w-full h-48 bg-gray-100">
            <Image
              src={previewMedia.thumbnailUrl || previewMedia.url}
              alt={project.title}
              fill
              className="object-cover"
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
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Demo</span>
              </a>
            )}
          </div>

          {/* Author */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
              {project.author.avatar && (
                <Image
                  src={project.author.avatar}
                  alt={project.author.name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{project.author.name}</p>
              <p className="text-xs text-gray-500">@{project.author.username}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

