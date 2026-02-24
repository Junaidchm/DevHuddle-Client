"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteCommentAdmin, getCommentById } from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ConfirmModal from "@/src/components/admin/ui/ConfirmModal";
import StatusBadge from "@/src/components/admin/ui/StatusBadge";
import Link from "next/link";
import { useState } from "react";

export default function CommentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const commentId = params.id as string;
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const queryClient = useQueryClient();
  const [deleteModal, setDeleteModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-comment", commentId, userId, userRole],
    queryFn: () => getCommentById(commentId, apiClient.getHeaders()),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCommentAdmin(commentId, apiClient.getHeaders()),
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      router.push("/admin/comments");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
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
          <p className="text-red-800">Error loading comment details.</p>
        </div>
      </div>
    );
  }

  const comment = data.data;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Comment Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Comment Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Content</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {comment.content || "No content"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Author ID</label>
                <p className="mt-1 text-sm text-gray-900">{comment.userId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Post ID</label>
                <p className="mt-1 text-sm text-gray-900">{comment.postId}</p>
                <Link href={`/admin/posts/${comment.postId}`} className="text-xs text-indigo-600 hover:underline">
                  Open parent post
                </Link>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <StatusBadge status={comment.deletedAt ? "deleted" : "active"} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Likes</label>
                <p className="mt-1 text-sm text-gray-900">{comment.likesCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Related Reports</h2>
            {comment.Reports && comment.Reports.length > 0 ? (
              <div className="space-y-3">
                {comment.Reports.map((report: any) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-gray-900 font-medium">{report.reason}</p>
                      <p className="text-xs text-gray-500">{report.status}</p>
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
            ) : (
              <p className="text-sm text-gray-500">No reports attached to this comment.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Moderation Actions</h2>
            {!comment.deletedAt && (
              <button
                onClick={() => setDeleteModal(true)}
                disabled={deleteMutation.isPending}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Comment
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Comment"
        message="This action permanently deletes the comment."
        confirmLabel="Delete Comment"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
