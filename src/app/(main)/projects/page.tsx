"use client";

import { useState } from "react";
import { useTrendingProjectsQuery } from "@/src/components/projects/hooks/useTrendingProjectsQuery";
import { useTopProjectsQuery } from "@/src/components/projects/hooks/useTopProjectsQuery";
import ProjectCard from "@/src/components/projects/ProjectCard";
import ProjectFilters from "@/src/components/projects/ProjectFilters";
import { Project, searchProjects } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import CreateProjectModal from "@/src/components/projects/CreateProjectModal";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";

type FilterType = "trending" | "top" | "newest";

export default function ProjectsPage() {
  const [filter, setFilter] = useState<FilterType>("trending");
  const [period, setPeriod] = useState<string>("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const authHeaders = useAuthHeaders();

  const trendingQuery = useTrendingProjectsQuery(
    filter === "trending" ? period : undefined
  );

  const topQuery = useTopProjectsQuery(filter === "top" ? period : undefined);

  const searchQueryResult = useQuery({
    queryKey: ["projects", "search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return { projects: [], nextCursor: null, totalCount: 0 };
      return await searchProjects(
        searchQuery,
        { cursor: null, limit: 20 },
        authHeaders
      );
    },
    enabled: showSearch && !!searchQuery.trim() && !!authHeaders.Authorization,
  });

  const activeQuery = showSearch && searchQuery.trim()
    ? searchQueryResult
    : filter === "trending"
    ? trendingQuery
    : topQuery;

  const projects: Project[] =
    showSearch && searchQuery.trim()
      ? searchQueryResult.data?.projects || []
      : activeQuery.data?.pages.flatMap((page) => page.projects) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Project Showcase</h1>
          <p className="text-muted-foreground">
            Discover amazing projects built by developers
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Create Project
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search projects by title, tech stack, or tags..."
            className="pl-9 pr-10 h-11"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearch(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {!showSearch && (
        <ProjectFilters
          filter={filter}
          period={period}
          onFilterChange={setFilter}
          onPeriodChange={setPeriod}
        />
      )}

      {activeQuery.isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-lg border border-border p-0 overflow-hidden h-full flex flex-col"
            >
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3 flex-1">
                   <Skeleton className="h-5 w-3/4" />
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-5/6" />
                </div>
            </div>
          ))}
        </div>
      )}

      {activeQuery.isError && (
        <div className="text-center py-20 bg-destructive/5 rounded-lg border border-destructive/20">
          <p className="text-destructive font-medium">Failed to load projects. Please try again later.</p>
        </div>
      )}

      {activeQuery.isSuccess && projects.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed border-border">
          <p className="text-muted-foreground">
            {showSearch && searchQuery.trim()
              ? "No projects found matching your search"
              : "No projects found yet. Be the first to create one!"}
          </p>
        </div>
      )}

      {activeQuery.isSuccess && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {!showSearch && "hasNextPage" in activeQuery && activeQuery.hasNextPage && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => activeQuery.fetchNextPage()}
                disabled={activeQuery.isFetchingNextPage}
                className="min-w-[150px]"
              >
                {activeQuery.isFetchingNextPage ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Loading...
                   </>
                ) : (
                    "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}

