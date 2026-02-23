"use client";

import { useState } from "react";
import { useTrendingProjectsQuery } from "@/src/components/projects/hooks/useTrendingProjectsQuery";
import { useTopProjectsQuery } from "@/src/components/projects/hooks/useTopProjectsQuery";
import { useListProjectsQuery } from "@/src/components/projects/hooks/useListProjectsQuery";
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
import { queryKeys } from "@/src/lib/queryKeys";

type FilterType = "trending" | "top" | "newest" | "my-projects";

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

  const listQuery = useListProjectsQuery({
    myProjects: filter === "my-projects" ? true : undefined,
  });

  const searchQueryResult = useQuery({
    queryKey: queryKeys.projects.search(searchQuery),
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
    : filter === "top"
    ? topQuery
    : listQuery;

  const projects: Project[] =
    showSearch && searchQuery.trim()
      ? searchQueryResult.data?.projects || []
      : (activeQuery as any).data?.pages?.flatMap((page: any) => page.projects) || [];

  return (
    <div className="container-centered py-6 animate-fadeIn">
      {/* Professional Header Section */}
      <div className="card-base p-6 mb-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-8 bg-primary rounded-full" />
             <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Project Showcase
             </h1>
          </div>
          <p className="text-muted-foreground text-base max-w-xl">
            Explore innovative projects built by the DevHuddle community. Share your creations and discover what others are building.
          </p>
        </div>
        
        <Button 
          className="h-11 px-8 font-semibold rounded-md shadow-sm transition-all hover:bg-brand-blue-hover active:scale-[0.98]" 
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="w-5 h-5 mr-2" />
          Showcase Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Filters & Info */}
        <div className="lg:col-span-3 space-y-6">
            <div className="card-base p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Discovery</h3>
                {!showSearch && (
                  <ProjectFilters
                    filter={filter}
                    period={period}
                    onFilterChange={setFilter}
                    onPeriodChange={setPeriod}
                  />
                )}
            </div>

            <div className="card-base p-5 bg-primary/5 border-primary/20">
                <h4 className="text-primary font-bold mb-2">Build Together</h4>
                <p className="text-xs text-primary/80 leading-relaxed">
                    Collaborate on open-source projects or find mentors to help you level up your skills.
                </p>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
            {/* Integrated Search Bar */}
            <div className="card-base p-3 flex items-center gap-3 group focus-within:border-primary/40 transition-all shadow-sm">
                <Search className="w-5 h-5 text-muted-foreground ml-2 group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  placeholder="Search projects, technologies, or tags..."
                  className="border-none bg-transparent focus-visible:ring-0 text-base h-10 px-0 placeholder:text-muted-foreground/60 w-full"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearch(false);
                    }}
                    className="h-8 w-8 rounded-full hover:bg-muted"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
            </div>


            {activeQuery.isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="card-base p-0 overflow-hidden h-full flex flex-col shadow-sm"
                  >
                      <Skeleton className="h-40 w-full rounded-none" />
                      <div className="p-5 space-y-4 flex-1">
                         <div className="flex gap-2">
                              <Skeleton className="h-4 w-12 rounded-full" />
                              <Skeleton className="h-4 w-16 rounded-full" />
                         </div>
                         <Skeleton className="h-6 w-3/4 rounded-md" />
                         <Skeleton className="h-3 w-full rounded-md" />
                         <Skeleton className="h-3 w-5/6 rounded-md" />
                      </div>
                  </div>
                ))}
              </div>
            )}

            {activeQuery.isError && (
              <div className="text-center py-16 card-base border-destructive/20 bg-destructive/5">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                     <X className="w-6 h-6 text-destructive" />
                </div>
                <h2 className="text-lg font-bold mb-1">Failed to load projects</h2>
                <p className="text-sm text-muted-foreground mb-6">There was an error connecting to the project showcase.</p>
                <Button onClick={() => (activeQuery as any).refetch()} variant="outline" size="sm" className="rounded-md px-6">Try Again</Button>
              </div>
            )}

            {activeQuery.isSuccess && projects.length === 0 && (
              <div className="text-center py-24 card-base border-dashed bg-muted/5">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-border">
                    <Plus className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No projects found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
                  {showSearch && searchQuery.trim()
                    ? "We couldn't find anything matching your search criteria."
                    : filter === "my-projects" 
                    ? "You haven't added any projects to your showcase yet."
                    : "Be the first to share a masterpiece with the community!"}
                </p>
                {!showSearch && (
                     <Button className="rounded-md px-8 shadow-sm" onClick={() => setIsCreateModalOpen(true)}>
                          Create My First Project
                     </Button>
                )}
              </div>
            )}

            {activeQuery.isSuccess && projects.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {!showSearch && "hasNextPage" in activeQuery && (activeQuery as any).hasNextPage && (
                  <div className="text-center pb-8 border-t border-border/40 pt-10">
                    <Button
                      variant="outline"
                      onClick={() => (activeQuery as any).fetchNextPage()}
                      disabled={(activeQuery as any).isFetchingNextPage}
                      className="min-w-[200px] h-11 border-primary/30 text-primary hover:bg-primary/5 transition-all font-semibold rounded-md"
                    >
                      {(activeQuery as any).isFetchingNextPage ? (
                         <>
                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                           Discovering more...
                         </>
                      ) : (
                          "Show More Projects"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
        </div>
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}

