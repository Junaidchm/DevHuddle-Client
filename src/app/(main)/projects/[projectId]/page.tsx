"use client";

import { use } from "react";
import { useProjectQuery } from "@/src/components/projects/hooks/useProjectQuery";
import ProjectDetail from "@/src/components/projects/ProjectDetail";
import { notFound } from "next/navigation";

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = use(params);
  const { data: project, isLoading, error } = useProjectQuery(projectId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProjectDetail project={project} />
    </div>
  );
}

