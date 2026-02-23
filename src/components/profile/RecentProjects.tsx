'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { listProjects } from '@/src/services/api/project.service';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import ProfileProjectPreviewCard from './ProfileProjectPreviewCard';
import { queryKeys } from '@/src/lib/queryKeys';
import { ArrowRight, Loader2 } from 'lucide-react';

interface RecentProjectsProps {
  userId: string;
  username: string;
  isOwnProfile: boolean;
}

const RecentProjects = ({ userId, username, isOwnProfile }: RecentProjectsProps) => {
  const authHeaders = useAuthHeaders();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.projects.user(userId, 2),
    queryFn: () => listProjects({
        authorId: userId,
        limit: 2
    }, authHeaders as Record<string, string>),
    enabled: !!userId && !!authHeaders.Authorization,
  });

  const projects = data?.projects || [];

  if (isLoading) {
    return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;
  }

  if (projects.length === 0) {
      if (isOwnProfile) {
          return (
             <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50/50">
                 <p className="text-muted-foreground text-sm mb-2">No projects yet.</p>
                 <Link href="/projects" className="text-primary text-sm font-medium hover:underline">Create a project</Link>
             </div>
          )
      }
      return <div className="text-center py-6 text-muted-foreground text-sm">No projects to show.</div>;
  }

  return (
    <div className="space-y-0">
      <div className="rounded-lg border border-border overflow-hidden bg-white">
          {projects.map((project: any) => (
            <ProfileProjectPreviewCard key={project.id} project={project} />
          ))}

          <Link
            href={`/profile/${username}/projects`}
            className="block w-full py-3 text-center text-sm font-semibold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors border-t border-border"
          >
            Show all projects <ArrowRight className="inline w-3 h-3 ml-1" />
          </Link>
      </div>
    </div>
  );
};

export default RecentProjects;
