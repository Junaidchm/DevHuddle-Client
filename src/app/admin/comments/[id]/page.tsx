"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCommentAdmin,
  getCommentById,
  hideComment,
} from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ConfirmModal from "@/src/components/admin/ui/ConfirmModal";
import StatusBadge from "@/src/components/admin/ui/StatusBadge";
import ContentIdentityCell from "@/src/components/admin/ui/ContentIdentityCell";
import Link from "next/link";
import { useState } from "react";
import { MODERATION_REASONS } from "@/src/constants/moderation.constants";

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
  const [hideModal, setHideModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-comment", commentId, userId, userRole],
    queryFn: () => getCommentById(commentId, apiClient.getHeaders() as any),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCommentAdmin(commentId, apiClient.getHeaders() as any),
    onSuccess: () => {
      toast.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      router.push("/admin/comments");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    },
  });

  const hideMutation = useMutation({
    mutationFn: ({ hidden, reason }: { hidden: boolean; reason?: string }) =>
      hideComment(commentId, { hidden, reason }, apiClient.getHeaders() as any),
    onSuccess: (_, variables) => {
      toast.success(variables.hidden ? "Comment hidden" : "Comment restored");
      setHideModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-comment", commentId] });
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update comment");
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
  const isDeleted = !!comment.deletedAt;
  const isHidden = !!comment.isHidden;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Comment Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Comment Content Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Comment Overview</h2>
              <StatusBadge status={isDeleted ? "deleted" : isHidden ? "hidden" : "active"} />
            </div>

            <div className="p-8 space-y-8">
              {/* Author & Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Author</span>
                  <div className="mt-1">
                    <ContentIdentityCell
                      name={comment.author?.name || "Unknown"}
                      username={comment.author?.username || comment.userId?.substring(0, 8) || "unknown"}
                      avatar={comment.author?.profilePicture}
                      avatarSize="md"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created On</span>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {comment.createdAt
                      ? new Date(comment.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Comment Content */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comment Content</span>
                <div className="p-6 bg-white border border-gray-100 rounded-xl">
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {comment.content || (
                      <span className="text-gray-400 italic font-normal">No content</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Related Post */}
              {comment.postId && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Related Post</span>
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {comment.post?.content || "View Related Post"}
                      </p>
                      <span className="text-xs text-gray-400 font-mono">ID: {comment.postId}</span>
                    </div>
                    <Link
                      href={`/admin/posts/${comment.postId}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Open <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Likes</span>
                  <span className="text-2xl font-black text-indigo-700">{comment.likesCount || 0}</span>
                </div>
                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Reports</span>
                  <span className="text-2xl font-black text-orange-700">{comment.reportsCount || comment.Reports?.length || 0}</span>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Replies</span>
                  <span className="text-2xl font-black text-emerald-700">{comment.repliesCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Reports Analysis</h2>
              {comment.Reports && comment.Reports.length > 0 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-black uppercase">
                  {comment.Reports.length} Reports Total
                </span>
              )}
            </div>
            <div className="p-6">
              {comment.Reports && comment.Reports.length > 0 ? (
                <div className="space-y-4">
                  {comment.Reports.map((report: any) => (
                    <div
                      key={report.id}
                      className="group flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <i className="fas fa-flag text-xs"></i>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-900 capitalize">
                            {report.reason?.replace(/_/g, " ").toLowerCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              report.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : report.status?.startsWith("RESOLVED")
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {report.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          {report.description || "No additional details provided."}
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-gray-400 font-medium">
                            <i className="far fa-clock mr-1"></i>
                            {new Date(report.createdAt).toLocaleString()}
                          </span>
                          <Link
                            href={`/admin/reports/${report.id}`}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                          >
                            Examine Report <i className="fas fa-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 mx-auto mb-4">
                    <i className="fas fa-shield-alt text-2xl"></i>
                  </div>
                  <p className="text-sm font-medium text-gray-500">No reports found for this comment.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Moderation Panel */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Moderation Hub</h2>
            </div>
            <div className="p-6 space-y-4">
              {!isDeleted ? (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      Current State
                    </span>
                    {isHidden ? (
                      <div className="text-yellow-700 font-bold text-sm flex items-center gap-2">
                        <i className="fas fa-eye-slash"></i> Comment is Hidden
                      </div>
                    ) : (
                      <div className="text-green-700 font-bold text-sm flex items-center gap-2">
                        <i className="fas fa-check-circle"></i> Publicly Visible
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {isHidden ? (
                      <button
                        onClick={() => hideMutation.mutate({ hidden: false })}
                        disabled={hideMutation.isPending}
                        className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <i className="fas fa-eye"></i> Restore Comment
                      </button>
                    ) : (
                      <button
                        onClick={() => setHideModal(true)}
                        className="w-full px-4 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-eye-slash"></i> Hide Comment
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteModal(true)}
                      disabled={deleteMutation.isPending}
                      className="w-full px-4 py-3 bg-white text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <i className="fas fa-trash-alt"></i> Permanent Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-red-50 rounded-xl text-center">
                  <i className="fas fa-trash-alt text-red-500 text-xl mb-2 block"></i>
                  <span className="text-sm font-bold text-red-700 uppercase">This comment was deleted</span>
                  <p className="text-[10px] text-red-500 mt-1 uppercase tracking-wider">No further actions possible</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Info */}
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-md shadow-indigo-100">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-80">Audit Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Comment ID</span>
                <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  {commentId.substring(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Post ID</span>
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded font-mono">
                  {comment.postId ? comment.postId.substring(0, 10) + "..." : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Last Updated</span>
                <span className="font-bold">
                  {comment.updatedAt ? new Date(comment.updatedAt).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={hideModal}
        onClose={() => setHideModal(false)}
        onConfirm={(reason) => hideMutation.mutate({ hidden: true, reason })}
        title="Hide Comment"
        message="This comment will be hidden from users. A moderation reason is required."
        confirmLabel="Hide Comment"
        confirmVariant="warning"
        reasonRequired={true}
        reasonOptions={MODERATION_REASONS}
        isLoading={hideMutation.isPending}
      />

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Comment"
        message="This action permanently deletes the comment and cannot be undone."
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
