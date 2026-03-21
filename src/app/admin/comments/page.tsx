"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getComments, getReportedComments, deleteCommentAdmin, hideComment } from "@/src/services/api/admin-panel.service";
import { MODERATION_REASONS } from "@/src/constants/moderation.constants";
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

export default function CommentsPage() {
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
    postId: "",
    userId: "",
    search: "",
    sortBy: "createdAt",
  });
  const [showReportedOnly, setShowReportedOnly] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 500);

  // Modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; commentId: string | null }>({
    isOpen: false,
    commentId: null,
  });
  const [hideModal, setHideModal] = useState<{ isOpen: boolean; commentId: string | null; isHidden: boolean }>({
    isOpen: false,
    commentId: null,
    isHidden: false,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-comments", page, limit, filters.status, filters.postId, filters.userId, debouncedSearch, filters.sortBy, showReportedOnly, userId, userRole],
    queryFn: () =>
      showReportedOnly
        ? getReportedComments({ page, limit, postId: filters.postId, userId: filters.userId, search: debouncedSearch }, apiClient.getHeaders() as any)
        : getComments({ page, limit, ...filters, search: debouncedSearch }, apiClient.getHeaders() as any),
    enabled: status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  useEffect(() => {
    if (highlightId && !isLoading) {
      setTimeout(() => {
        highlightedRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [highlightId, isLoading]);

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteCommentAdmin(commentId, apiClient.getHeaders() as any),
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      setDeleteModal({ isOpen: false, commentId: null });
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete comment");
    },
  });

  const hideMutation = useMutation({
    mutationFn: ({ commentId, hidden, reason }: { commentId: string; hidden: boolean; reason?: string }) =>
      hideComment(commentId, { hidden, reason }, apiClient.getHeaders() as any),
    onSuccess: (_, variables) => {
      toast.success(variables.hidden ? "Comment hidden successfully" : "Comment unhidden successfully");
      setHideModal({ isOpen: false, commentId: null, isHidden: false });
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Action failed");
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
          <p className="text-red-800">Error loading comments. Please try again.</p>
        </div>
      </div>
    );
  }

  const comments = data?.data?.comments || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleClearFilter = () => {
    setPage(1);
    setFilters({
      status: "all",
      postId: "",
      userId: "",
      search: "",
      sortBy: "createdAt",
    });
    setShowReportedOnly(false);
  };

  return (
    <div className="p-6 w-full h-full">
      <Card>
        <CardHeader title="Comments Management">
          <SearchInput
            placeholder="Search comments..."
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
                { label: "Deleted", value: "deleted" },
              ]}
            />
            <FilterSelect
              label="Sort By"
              id="sort-filter"
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              value={filters.sortBy}
              options={[
                { label: "Most Recent", value: "createdAt" },
                // Add other sort options if supported by backend
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
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Comment Content</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Author</th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">Related Post</th>
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
                      <span className="font-medium">Fetching comments...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block max-w-md">
                      <i className="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                      <p className="text-red-800 font-bold">Error loading comments</p>
                      <p className="text-red-600 text-sm mt-1">{(error as any)?.response?.data?.message || "Please refresh the page"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                comments.map((comment: any) => (
                  <tr 
                    key={comment.id} 
                    ref={comment.id === highlightId ? highlightedRowRef : null}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-all duration-500 ${
                      comment.id === highlightId ? "bg-indigo-50/50 shadow-[inset_4px_0_0_0_#4f46e5]" : ""
                    }`}
                  >
                    <td className="p-4">
                      <div className="relative inline-block">
                        <input type="checkbox" id={`comment-${comment.id}`} className="peer sr-only" />
                        <label htmlFor={`comment-${comment.id}`} className="w-[18px] h-[18px] border border-gray-300 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 peer-checked:bg-indigo-600 peer-checked:border-indigo-600">
                          <i className="fas fa-check text-white text-[0.625rem] hidden peer-checked:inline-block"></i>
                        </label>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs xl:max-w-md">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {comment.content}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          ID: {comment.id.substring(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <ContentIdentityCell
                        name={comment.author?.name || "User"}
                        username={comment.author?.username || comment.userId.substring(0, 8)}
                        avatar={comment.author?.profilePicture}
                        avatarSize="sm"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 max-w-[200px]">
                        <p className="text-xs text-gray-700 truncate font-medium">
                          {comment.post?.content || "View Related Post"}
                        </p>
                        <Link 
                          href={`/admin/posts/${comment.postId}`}
                          className="text-[10px] text-indigo-600 hover:underline"
                        >
                          Post ID: {comment.postId.substring(0, 8)}...
                        </Link>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={comment.deletedAt ? "deleted" : comment.isHidden ? "hidden" : "active"} />
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/comments/${comment.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        {!comment.deletedAt && (
                          <>
                            <button
                              onClick={() => setHideModal({ 
                                isOpen: true, 
                                commentId: comment.id, 
                                isHidden: !comment.isHidden 
                              })}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                comment.isHidden 
                                  ? "text-green-500 hover:bg-green-50" 
                                  : "text-amber-500 hover:bg-amber-50"
                              }`}
                              title={comment.isHidden ? "Unhide Comment" : "Hide Comment"}
                              disabled={hideMutation.isPending}
                            >
                              <i className={`fas ${comment.isHidden ? "fa-eye" : "fa-eye-slash"}`}></i>
                            </button>
                            <button
                              onClick={() => setDeleteModal({ isOpen: true, commentId: comment.id })}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete Comment"
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
              )}
            </tbody>
          </table>
          {comments.length === 0 && !isLoading && !error && (
            <div className="p-12 text-center text-gray-500">
              No comments found.
            </div>
          )}
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

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, commentId: null })}
        onConfirm={() => {
          if (deleteModal.commentId) {
            deleteMutation.mutate(deleteModal.commentId);
          }
        }}
        title="Delete Comment"
        message="Are you sure you want to permanently delete this comment? This action cannot be undone."
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmModal
        isOpen={hideModal.isOpen}
        onClose={() => setHideModal({ isOpen: false, commentId: null, isHidden: false })}
        onConfirm={(reason) => {
          if (hideModal.commentId) {
            hideMutation.mutate({ 
              commentId: hideModal.commentId, 
              hidden: hideModal.isHidden,
              reason 
            });
          }
        }}
        title={hideModal.isHidden ? "Hide Comment" : "Unhide Comment"}
        message={hideModal.isHidden 
          ? "Are you sure you want to hide this comment? It will no longer be visible to users." 
          : "Are you sure you want to make this comment visible again?"}
        confirmLabel={hideModal.isHidden ? "Hide Comment" : "Unhide Comment"}
        confirmVariant={hideModal.isHidden ? "warning" : "primary"}
        isLoading={hideMutation.isPending}
        reasonRequired={hideModal.isHidden}
        reasonOptions={hideModal.isHidden ? MODERATION_REASONS : undefined}
      />
    </div>
  );
}
