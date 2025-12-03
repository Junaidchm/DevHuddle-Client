"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommentById, deleteCommentAdmin } from "@/src/services/api/admin-panel.service";
import { toast } from "react-toastify";

export default function CommentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const commentId = params.id as string;

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-comment", commentId],
    queryFn: () => getCommentById(commentId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCommentAdmin(commentId),
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      router.push("/admin/comments");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
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
          <p className="text-red-800">Error loading comment. Please try again.</p>
        </div>
      </div>
    );
  }

  const comment = data.data;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Comment Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Comment Content</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Content</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{comment.content}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User ID</label>
                <p className="mt-1 text-sm text-gray-900">{comment.userId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Post ID</label>
                <p className="mt-1 text-sm text-gray-900">{comment.postId}</p>
              </div>
              {comment.Post && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Parent Post</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {comment.Post.content?.substring(0, 200)}...
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  {comment.deletedAt ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      Deleted
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Likes</label>
                <p className="mt-1 text-sm text-gray-900">{comment.likesCount || 0}</p>
              </div>
              {comment.Reports && comment.Reports.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Reports</label>
                  <div className="mt-2 space-y-2">
                    {comment.Reports.map((report: any) => (
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
            {!comment.deletedAt && (
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this comment?")) {
                    deleteMutation.mutate();
                  }
                }}
                disabled={deleteMutation.isPending}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete Comment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

