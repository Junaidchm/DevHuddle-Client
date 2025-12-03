"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, hidePost, deletePostAdmin } from "@/src/services/api/admin-panel.service";
import { toast } from "react-toastify";
import { useState } from "react";

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const [showHideModal, setShowHideModal] = useState(false);
  const [hideReason, setHideReason] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-post", postId],
    queryFn: () => getPostById(postId),
  });

  const hideMutation = useMutation({
    mutationFn: ({ hidden, reason }: { hidden: boolean; reason?: string }) =>
      hidePost(postId, { hidden, reason }),
    onSuccess: () => {
      toast.success("Post updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-post", postId] });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      setShowHideModal(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update post");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePostAdmin(postId),
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      router.push("/admin/posts");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete post");
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
          <p className="text-red-800">Error loading post. Please try again.</p>
        </div>
      </div>
    );
  }

  const post = data.data;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Post Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Post Content</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Content</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{post.content}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="mt-1 text-sm text-gray-900">{post.userId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1 flex gap-2">
                  {post.isHidden && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Hidden
                    </span>
                  )}
                  {post.deletedAt && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Deleted
                    </span>
                  )}
                  {!post.isHidden && !post.deletedAt && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
              {post.hiddenReason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Hide Reason</label>
                  <p className="mt-1 text-sm text-gray-900">{post.hiddenReason}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Likes</label>
                  <p className="mt-1 text-sm text-gray-900">{post.likesCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Comments</label>
                  <p className="mt-1 text-sm text-gray-900">{post.commentsCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reports</label>
                  <p className="mt-1 text-sm text-gray-900">{post.reportsCount || 0}</p>
                </div>
              </div>
              {post.Reports && post.Reports.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reports</label>
                  <div className="mt-2 space-y-2">
                    {post.Reports.map((report: any) => (
                      <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{report.reason}</span> - {report.status}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            {!post.deletedAt && (
              <div className="space-y-3">
                {post.isHidden ? (
                  <button
                    onClick={() => hideMutation.mutate({ hidden: false })}
                    disabled={hideMutation.isPending}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Unhide Post
                  </button>
                ) : (
                  <button
                    onClick={() => setShowHideModal(true)}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Hide Post
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this post?")) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Delete Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hide Modal */}
      {showHideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Hide Post</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Required)
              </label>
              <textarea
                value={hideReason}
                onChange={(e) => setHideReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                placeholder="Enter reason for hiding this post..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (hideReason.trim()) {
                    hideMutation.mutate({ hidden: true, reason: hideReason });
                  } else {
                    toast.error("Reason is required");
                  }
                }}
                disabled={hideMutation.isPending || !hideReason.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {hideMutation.isPending ? "Processing..." : "Hide Post"}
              </button>
              <button
                onClick={() => {
                  setShowHideModal(false);
                  setHideReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

