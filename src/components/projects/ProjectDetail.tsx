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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>

        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {project.author.avatar && (
              <Image
                src={project.author.avatar}
                alt={project.author.name}
                width={40}
                height={40}
                className="object-cover"
              />
            )}
          </div>
          <div>
            <p className="font-medium">{project.author.name}</p>
            <p className="text-sm text-gray-500">@{project.author.username}</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-4">
          {project.repositoryUrls.map((url, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">Repository {index + 1}</span>
            </a>
          ))}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="text-sm">Live Demo</span>
            </a>
          )}
        </div>
      </div>

      {/* Media Gallery */}
      {project.media.length > 0 && (
        <div className="border-b">
          <ProjectMediaGallery media={project.media} />
        </div>
      )}

      {/* Description */}
      <div className="p-6 border-b">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: project.description }}
        />
      </div>

      {/* Tech Stack & Tags */}
      <div className="p-6 border-b">
        {project.techStack.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Engagement */}
      <div className="p-6">
        <ProjectEngagement
          project={project}
          onLike={handleLike}
          onShare={() => {}}
          isLiking={isLiking || isUnliking}
        />
      </div>
    </div>
  );
}

