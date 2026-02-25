"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjects, getReportedProjects, hideProject, deleteProjectAdmin } from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Card } from "@/src/components/admin/ui/Card";
import { CardHeader } from "@/src/components/admin/ui/CardHeader";
import { SearchInput } from "@/src/components/admin/ui/SearchInput";
import { FilterBar } from "@/src/components/admin/ui/FilterBar";
import { FilterSelect } from "@/src/components/admin/ui/FilterSelect";
import StatusBadge from "@/src/components/admin/ui/StatusBadge";
import ConfirmModal from "@/src/components/admin/ui/ConfirmModal";
import ContentIdentityCell from "@/src/components/admin/ui/ContentIdentityCell";
import useDebounce from "@/src/customHooks/useDebounce";
import { MODERATION_REASONS } from "@/src/constants/moderation.constants";

export default function ProjectsPage() {
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("id");
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);

  const [filters, setFilters] = useState({
    status: "all",
    userId: "",
    search: "",
    sortBy: "createdAt",
  });
  const [showReportedOnly, setShowReportedOnly] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  // Modal states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string | null }>({
    isOpen: false,
    projectId: null,
  });
  const [hideModal, setHideModal] = useState<{ isOpen: boolean; projectId: string | null }>({
    isOpen: false,
    projectId: null,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-projects", page, limit, filters.status, filters.userId, debouncedSearch, filters.sortBy, showReportedOnly, userId, userRole],
    queryFn: () =>
      showReportedOnly
        ? getReportedProjects({ page, limit, userId: filters.userId, search: debouncedSearch }, apiClient.getHeaders() as any)
        : getProjects({ page, limit, ...filters, search: debouncedSearch }, apiClient.getHeaders() as any),
    enabled: status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  useEffect(() => {
    if (highlightId && !isLoading) {
      setTimeout(() => {
        highlightedRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [highlightId, isLoading]);

  const hideMutation = useMutation({
    mutationFn: ({ projectId, hidden, reason }: { projectId: string; hidden: boolean; reason?: string }) =>
      hideProject(projectId, { hidden, reason }, apiClient.getHeaders() as any),
    onSuccess: (_, variables) => {
      toast.success(`Project ${variables.hidden ? "hidden" : "unhidden"} successfully`);
      setHideModal({ isOpen: false, projectId: null });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update project");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => deleteProjectAdmin(projectId, apiClient.getHeaders() as any),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      setDeleteModal({ isOpen: false, projectId: null });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete project");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading projects. Please try again.</p>
        </div>
      </div>
    );
  }

  const projects = data?.data?.projects || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleClearFilter = () => {
    setPage(1);
    setFilters({
      status: "all",
      userId: "",
      search: "",
      sortBy: "createdAt",
    });
    setShowReportedOnly(false);
  };

  return (
    <div className="p-6 w-full h-full">
      <Card>
        <CardHeader title="Projects Management">
          <SearchInput
            placeholder="Search projects by title..."
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            value={filters.search}
          />
        </CardHeader>

        <div className="overflow-x-auto">
          <FilterBar onClearFilters={handleClearFilter}>
            <FilterSelect
              label="Status"
              id="status-filter"
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              value={filters.status}
              options={[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Reported", value: "reported" },
                { label: "Hidden", value: "hidden" },
                { label: "Deleted", value: "deleted" },
              ]}
            />
            <FilterSelect
              label="Sort By"
              id="sort-filter"
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              value={filters.sortBy}
              options={[
                { label: "Date Created", value: "createdAt" },
                { label: "Reports Count", value: "reportsCount" },
                { label: "Likes Count", value: "likesCount" },
              ]}
            />
            <div className="flex flex-col gap-1 max-[768px]:w-full">
              <label className="text-xs text-gray-500 font-medium">Extra</label>
              <label className="flex items-center gap-2 h-[38px] px-2 border border-gray-200 rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={showReportedOnly}
                  onChange={(e) => setShowReportedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Reported Only</span>
              </label>
            </div>
          </FilterBar>

          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  <div className="relative inline-block">
                    <input type="checkbox" id="select-all" className="peer sr-only" />
                    <label htmlFor="select-all" className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600">
                      <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
                    </label>
                  </div>
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Project Title</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Owner</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Reports</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Status</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Created</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <i className="fas fa-circle-notch fa-spin text-2xl text-indigo-600"></i>
                      <span className="font-medium">Fetching projects...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block max-w-md">
                      <i className="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                      <p className="text-red-800 font-bold">Error loading projects</p>
                      <p className="text-red-600 text-sm mt-1">{(error as any)?.response?.data?.message || "Please refresh the page"}</p>
                    </div>
                  </td>
                </tr>
              ) : projects.length > 0 ? (
                projects.map((project: any) => (
                  <tr 
                    key={project.id} 
                    ref={project.id === highlightId ? highlightedRowRef : null}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-all duration-500 ${
                      project.id === highlightId ? "bg-indigo-50/50 shadow-[inset_4px_0_0_0_#4f46e5]" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="relative inline-block">
                        <input type="checkbox" id={`project-${project.id}`} className="peer sr-only" />
                        <label htmlFor={`project-${project.id}`} className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600">
                          <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
                        </label>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs xl:max-w-md">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {project.title || "Untitled Project"}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {project.id.substring(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <ContentIdentityCell
                        name={project.owner?.name || project.author?.name || "Unknown"}
                        username={project.owner?.username || project.author?.username || "unknown"}
                        avatar={project.owner?.profilePicture || project.author?.profilePicture}
                      />
                    </td>
                    <td className="p-4">
                      <span className={`text-sm font-semibold ${project.reportsCount > 0 ? "text-orange-600" : "text-gray-600"}`}>
                        {project.reportsCount || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {project.deletedAt ? (
                          <StatusBadge status="deleted" />
                        ) : project.isHidden ? (
                          <StatusBadge status="hidden" />
                        ) : project.reportsCount > 0 ? (
                          <StatusBadge status="reported" />
                        ) : (
                          <StatusBadge status="active" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        {!project.deletedAt && (
                          <>
                            {project.isHidden ? (
                              <button
                                onClick={() => hideMutation.mutate({ projectId: project.id, hidden: false })}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors"
                                title="Unhide Project"
                                disabled={hideMutation.isPending}
                              >
                                <i className={`fas ${hideMutation.isPending ? "fa-spinner fa-spin" : "fa-eye"}`}></i>
                              </button>
                            ) : (
                              <button
                                onClick={() => setHideModal({ isOpen: true, projectId: project.id })}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-500 hover:bg-yellow-50 transition-colors"
                                title="Hide Project"
                                disabled={hideMutation.isPending}
                              >
                                <i className="fas fa-eye-slash"></i>
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, projectId: project.id })}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete Project"
                              disabled={deleteMutation.isPending}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    No projects found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-200 gap-4">
          <div className="flex gap-1">
            <button
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-all duration-300 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage((pre) => Math.max(pre - 1, 1))}
            >
              <i className="fas fa-chevron-left"></i>
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-md flex items-center justify-center font-medium ${
                  page === i + 1
                    ? "text-white bg-indigo-600"
                    : "text-gray-800 hover:bg-gray-100"
                } transition-all duration-300`}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-800 disabled:text-gray-400 hover:bg-gray-100 transition-all duration-300"
              disabled={page === totalPages}
              onClick={() => setPage((pre) => Math.min(pre + 1, totalPages))}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-start">
            <label htmlFor="page-size">Show</label>
            <select
              id="page-size"
              onChange={(e) => setLimit(Number(e.target.value))}
              value={limit}
              className="p-1 border border-gray-200 rounded-md text-sm text-gray-800 bg-white min-w-[70px] outline-none focus:border-indigo-600"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <ConfirmModal
        isOpen={hideModal.isOpen}
        onClose={() => setHideModal({ isOpen: false, projectId: null })}
        onConfirm={(reason) => {
          if (hideModal.projectId) {
            hideMutation.mutate({ projectId: hideModal.projectId, hidden: true, reason });
          }
        }}
        title="Hide Project"
        message="Are you sure you want to hide this project? It will no longer be visible to users but will remain in the database."
        confirmLabel="Hide Project"
        confirmVariant="warning"
        reasonRequired={true}
        reasonOptions={MODERATION_REASONS}
        isLoading={hideMutation.isPending}
      />

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, projectId: null })}
        onConfirm={() => {
          if (deleteModal.projectId) {
            deleteMutation.mutate(deleteModal.projectId);
          }
        }}
        title="Delete Project"
        message="This action is irreversible. Are you sure you want to permanently delete this project and all its associated data?"
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
