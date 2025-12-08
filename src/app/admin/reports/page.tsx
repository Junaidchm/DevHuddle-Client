"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReports, takeReportAction, bulkReportAction } from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useAdminRedirectIfNotAuthenticated } from "@/src/customHooks/useAdminAuthenticated";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ReportsPage() {
  const { isChecking } = useAdminRedirectIfNotAuthenticated("/admin/signIn");
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  
  // ✅ FIXED: Stable query key using userId/role instead of token
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filters, setFilters] = useState({
    status: "all",
    targetType: "all",
    severity: "all",
    reason: "all",
    sortBy: "createdAt",
  });
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-reports", page, limit, filters, userId, userRole],
    queryFn: () => {
      return getReports({ page, limit, ...filters }, apiClient.getHeaders());
    },
    enabled: status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
    retry: 1,
    onError: (err: any) => {
      console.error("Reports query error:", err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        toast.error("Session expired. Please log in again.");
      }
    },
  });

  const actionMutation = useMutation({
    mutationFn: ({ reportId, ...data }: { reportId: string; action: string; resolution?: string; hideContent?: boolean; suspendUser?: boolean }) =>
      takeReportAction(reportId, data as any, apiClient.getHeaders()),
    onSuccess: () => {
      toast.success("Action completed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setSelectedReports([]);
    },
    onError: (error: any) => {
      console.error("Report action error:", error);
      
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error("Request timed out. The action may still be processing. Please refresh the page.", {
          duration: 6000,
        });
        queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
        return;
      }
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || !error.response) {
        toast.error("Network error. Please check your connection and try again.", {
          duration: 5000,
        });
        return;
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to take action";
      toast.error(errorMessage, {
        duration: 5000,
      });
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: (data: { reportIds: string[]; action: string; resolution?: string }) =>
      bulkReportAction(data, apiClient.getHeaders()),
    onSuccess: () => {
      toast.success("Bulk action completed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setSelectedReports([]);
    },
    onError: (error: any) => {
      console.error("Bulk report action error:", error);
      
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error("Bulk action timed out. Some actions may still be processing. Please refresh the page.", {
          duration: 6000,
        });
        queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
        return;
      }
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || !error.response) {
        toast.error("Network error. Please check your connection and try again.", {
          duration: 5000,
        });
        return;
      }
      
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to perform bulk action";
      toast.error(errorMessage, {
        duration: 5000,
      });
    },
  });

  const handleAction = (reportId: string, action: "APPROVE" | "REMOVE" | "IGNORE", resolution?: string) => {
    actionMutation.mutate({
      reportId,
      action,
      resolution,
      hideContent: action === "REMOVE",
    });
  };

  const handleBulkAction = (action: "APPROVE" | "REMOVE" | "IGNORE") => {
    if (selectedReports.length === 0) {
      toast.warning("Please select at least one report");
      return;
    }
    bulkActionMutation.mutate({
      reportIds: selectedReports,
      action,
    });
  };

  const toggleSelectReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === data?.data?.reports?.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(data?.data?.reports?.map((r: any) => r.id) || []);
    }
  };

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
    const errorMessage = (error as any)?.response?.data?.message || "Failed to load reports";
    const isAuthError = (error as any)?.response?.status === 401 || (error as any)?.response?.status === 403;
    
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-exclamation-circle text-red-600"></i>
            <p className="text-red-800 font-medium">Error loading reports</p>
          </div>
          <p className="text-red-700 text-sm">{errorMessage}</p>
          {isAuthError && (
            <p className="text-red-600 text-xs mt-2">
              Your session may have expired. Please <Link href="/admin/signIn" className="underline">log in again</Link>.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const reports = data?.data?.reports || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reports Management</h1>
        {selectedReports.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("APPROVE")}
              disabled={bulkActionMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Approve Selected ({selectedReports.length})
            </button>
            <button
              onClick={() => handleBulkAction("REMOVE")}
              disabled={bulkActionMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Remove Selected ({selectedReports.length})
            </button>
            <button
              onClick={() => handleBulkAction("IGNORE")}
              disabled={bulkActionMutation.isPending}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Ignore Selected ({selectedReports.length})
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="PENDING">Pending</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED_APPROVED">Resolved (Approved)</option>
              <option value="RESOLVED_REMOVED">Resolved (Removed)</option>
              <option value="RESOLVED_IGNORED">Resolved (Ignored)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
            <select
              value={filters.targetType}
              onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="POST">Post</option>
              <option value="COMMENT">Comment</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select
              value={filters.reason}
              onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All</option>
              <option value="SPAM">Spam</option>
              <option value="INAPPROPRIATE">Inappropriate</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="HATE_SPEECH">Hate Speech</option>
              <option value="VIOLENCE">Violence</option>
              <option value="SELF_HARM">Self Harm</option>
              <option value="FALSE_INFORMATION">False Information</option>
              <option value="COPYRIGHT_VIOLATION">Copyright Violation</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="createdAt">Date</option>
              <option value="severity">Severity</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  checked={selectedReports.length === reports.length && reports.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <i className="fas fa-inbox text-gray-400 text-4xl"></i>
                    <p className="text-gray-500 font-medium">No reports found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report: any) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedReports.includes(report.id)}
                    onChange={() => toggleSelectReport(report.id)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {report.targetType}
                    </span>
                    {report.Post && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {report.Post.content?.substring(0, 50)}...
                      </p>
                    )}
                    {report.Comment && (
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {report.Comment.content?.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{report.reason}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.severity === "CRITICAL"
                        ? "bg-red-100 text-red-800"
                        : report.severity === "HIGH"
                        ? "bg-orange-100 text-orange-800"
                        : report.severity === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {report.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      report.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : report.status === "OPEN"
                        ? "bg-blue-100 text-blue-800"
                        : report.status === "INVESTIGATING"
                        ? "bg-purple-100 text-purple-800"
                        : report.status?.startsWith("RESOLVED_")
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </Link>
                    {report.status === "PENDING" || report.status === "OPEN" ? (
                      <>
                        <button
                          onClick={() => handleAction(report.id, "APPROVE")}
                          className="text-green-600 hover:text-green-900"
                          disabled={actionMutation.isPending}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(report.id, "REMOVE")}
                          className="text-red-600 hover:text-red-900"
                          disabled={actionMutation.isPending}
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleAction(report.id, "IGNORE")}
                          className="text-gray-600 hover:text-gray-900"
                          disabled={actionMutation.isPending}
                        >
                          Ignore
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

