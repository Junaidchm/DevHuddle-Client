"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteProjectAdmin,
  getProjectById,
  getReports,
  hideProject,
} from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";
import ConfirmModal from "@/src/components/admin/ui/ConfirmModal";
import StatusBadge from "@/src/components/admin/ui/StatusBadge";
import ProjectMediaGallery from "@/src/components/projects/ProjectMediaGallery";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const queryClient = useQueryClient();

  const [hideModal, setHideModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-project", projectId, userId, userRole],
    queryFn: () => getProjectById(projectId, apiClient.getHeaders()),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const { data: reportData } = useQuery({
    queryKey: ["admin-project-reports", projectId, userId, userRole],
    queryFn: () =>
      getReports(
        {
          page: 1,
          limit: 5,
          targetType: "PROJECT",
          search: projectId,
          sortBy: "createdAt",
        },
        apiClient.getHeaders()
      ),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const hideMutation = useMutation({
    mutationFn: ({ hidden, reason }: { hidden: boolean; reason?: string }) =>
      hideProject(projectId, { hidden, reason }, apiClient.getHeaders()),
    onSuccess: () => {
      toast.success("Project status updated");
      setHideModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update project");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProjectAdmin(projectId, apiClient.getHeaders()),
    onSuccess: () => {
      toast.success("Project removed");
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      router.push("/admin/projects");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove project");
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

  if (error || !data?.data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading project details.</p>
        </div>
      </div>
    );
  }

  const project = data.data;
  const relatedReports = (reportData?.data?.reports || []).filter(
    (report: any) => report.targetId === project.id
  );
  const isRemoved = project.status === "REMOVED" || !!project.removedAt || !!project.deletedAt;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Project Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="mt-1 text-sm text-gray-900">{project.title || "Untitled"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {project.description || "No description"}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <StatusBadge
                      status={isRemoved ? "hidden" : (project.reportsCount || 0) > 0 ? "reported" : "active"}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reports</label>
                  <p className="mt-1 text-sm text-gray-900">{project.reportsCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Likes</label>
                  <p className="mt-1 text-sm text-gray-900">{project.likesCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Comments</label>
                  <p className="mt-1 text-sm text-gray-900">{project.commentsCount || 0}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Owner</label>
                <p className="mt-1 text-sm text-gray-900">
                  {project.author?.name || "Unknown"} ({project.author?.username || project.userId})
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {project.createdAt ? new Date(project.createdAt).toLocaleString() : "-"}
                </p>
              </div>
              {!!project.publishedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Published</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(project.publishedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {project.media && project.media.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Project Media</h2>
              </div>
              <div className="bg-black">
                <ProjectMediaGallery media={project.media} />
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
            {relatedReports.length === 0 ? (
              <p className="text-sm text-gray-500">No report records found for this project.</p>
            ) : (
              <div className="space-y-3">
                {relatedReports.map((report: any) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-gray-900 font-medium">{report.reason}</div>
                      <div className="text-xs text-gray-500">{report.status}</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
                    >
                      Open report
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Moderation Actions</h2>
            <div className="space-y-3">
              {isRemoved ? (
                <button
                  onClick={() => hideMutation.mutate({ hidden: false })}
                  disabled={hideMutation.isPending}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Restore Project
                </button>
              ) : (
                <button
                  onClick={() => setHideModal(true)}
                  disabled={hideMutation.isPending}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  Hide Project
                </button>
              )}
              <button
                onClick={() => setDeleteModal(true)}
                disabled={deleteMutation.isPending}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Remove Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={hideModal}
        onClose={() => setHideModal(false)}
        onConfirm={(reason) => hideMutation.mutate({ hidden: true, reason })}
        title="Hide Project"
        message="This project will be hidden from user views. A moderation reason is required."
        confirmLabel="Hide Project"
        confirmVariant="warning"
        reasonRequired={true}
        isLoading={hideMutation.isPending}
      />

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Remove Project"
        message="This moderation action removes the project from visibility. Continue?"
        confirmLabel="Remove Project"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
