"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserReportedContent } from "@/src/services/api/admin-panel.service";
import Link from "next/link";

export default function UserReportedContentPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user-reported-content", userId],
    queryFn: () => getUserReportedContent(userId),
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
          <p className="text-red-800">Error loading content. Please try again.</p>
        </div>
      </div>
    );
  }

  const { posts, comments } = data.data;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">User Reported Content</h1>
      </div>

      <div className="space-y-6">
        {/* Reported Posts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Reported Posts ({posts?.length || 0})</h2>
          {posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post: any) => (
                <div key={post.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-2">{post.content?.substring(0, 200)}...</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Reports: {post.reportsCount || 0}</span>
                        <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.isHidden && (
                          <span className="text-red-600 font-medium">Hidden</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="ml-4 text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No reported posts</p>
          )}
        </div>

        {/* Reported Comments */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Reported Comments ({comments?.length || 0})</h2>
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <div key={comment.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 mb-2">{comment.content?.substring(0, 200)}...</p>
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span>Post ID: {comment.postId}</span>
                        <span>Created: {new Date(comment.createdAt).toLocaleDateString()}</span>
                        {comment.deletedAt && (
                          <span className="text-red-600 font-medium">Deleted</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/admin/comments/${comment.id}`}
                      className="ml-4 text-indigo-600 hover:text-indigo-900 text-sm"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No reported comments</p>
          )}
        </div>
      </div>
    </div>
  );
}

