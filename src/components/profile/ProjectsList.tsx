'use client';

import React from 'react';
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import ProjectCard from "../projects/ProjectCard";
import { listProjects } from "@/src/services/api/project.service";
import InfiniteScrollContainer from "../layouts/InfiniteScrollContainer";
import { Loader2 } from "lucide-react";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { queryKeys } from '@/src/lib/queryKeys';

interface ProjectsListProps {
  userId: string; // The profile owner
  currentUserId?: string; // The viewer
}

const ProjectsList = ({ userId, currentUserId }: ProjectsListProps) => {
  const { status: sessionStatus } = useSession();
  const authHeaders = useAuthHeaders();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    status,
    error
  } = useInfiniteQuery({
    queryKey: queryKeys.projects.user(userId),
    queryFn: ({ pageParam }) => listProjects({
        cursor: pageParam,
        authorId: userId,
        limit: 10
    }, authHeaders as Record<string, string>),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    enabled: sessionStatus !== "loading" && !!authHeaders.Authorization,
  });

  const projects = data?.pages.flatMap(
    (page) => page.projects
  ) || [];

  if (status === "pending") {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-600" /></div>;
  }

  if (status === "error") {
      console.error("Projects fetch error:", error);
      return (
          <div className="text-center py-10 text-red-500">
              Failed to load projects.
          </div>
      );
  }

  if (status === "success" && !projects.length) {
      return (
          <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300 mt-4">
              <p className="text-gray-500">No projects to show yet.</p>
              {currentUserId === userId && (
                  <button className="mt-4 px-4 py-2 border border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition">
                      Create a project
                  </button>
              )}
          </div>
      );
  }

  return (
    <div className="space-y-4 mt-4">
        <InfiniteScrollContainer
            className="flex flex-col gap-4"
            onBottomReached={() => !isLoading && hasNextPage && fetchNextPage()}
        >
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
            {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin text-purple-600" />}
        </InfiniteScrollContainer>
    </div>
  );
};

export default ProjectsList;
