"use client";

import { useState } from "react";
import { useTrendingProjectsQuery } from "@/src/components/projects/hooks/useTrendingProjectsQuery";
import { useTopProjectsQuery } from "@/src/components/projects/hooks/useTopProjectsQuery";
import ProjectCard from "@/src/components/projects/ProjectCard";
import ProjectFilters from "@/src/components/projects/ProjectFilters";
import { Project, searchProjects } from "@/src/services/api/project.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

type FilterType = "trending" | "top" | "newest";

export default function ProjectsPage() {
  const [filter, setFilter] = useState<FilterType>("trending");
  const [period, setPeriod] = useState<string>("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Project Showcase</h1>
          <p className="text-gray-600">
            Discover amazing projects built by developers
          </p>
        </div>
        <Link
          href="/projects/create"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Project</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search projects by title, tech stack, or tags..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setShowSearch(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
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
              className="bg-white rounded-lg shadow-md p-6 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      )}

      {activeQuery.isError && (
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load projects</p>
        </div>
      )}

      {activeQuery.isSuccess && projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {showSearch && searchQuery.trim()
              ? "No projects found matching your search"
              : "No projects found"}
          </p>
        </div>
      )}

      {activeQuery.isSuccess && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {!showSearch && "hasNextPage" in activeQuery && activeQuery.hasNextPage && (
            <div className="text-center">
              <button
                onClick={() => activeQuery.fetchNextPage()}
                disabled={activeQuery.isFetchingNextPage}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {activeQuery.isFetchingNextPage
                  ? "Loading..."
                  : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

