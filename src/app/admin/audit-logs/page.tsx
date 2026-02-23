"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useAdminRedirectIfNotAuthenticated } from "@/src/customHooks/useAdminAuthenticated";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AuditLogsPage() {
  const { isChecking } = useAdminRedirectIfNotAuthenticated("/admin/signIn");
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    adminId: "",
    targetType: "all",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-audit-logs", page, limit, filters, userId, userRole],
    queryFn: () => {
      const params = {
        page,
        limit,
        targetType: filters.targetType === "all" ? undefined : filters.targetType,
        adminId: filters.adminId || undefined,
      };
      return getAuditLogs(params, apiClient.getHeaders() as Record<string, string>);
    },
    enabled: status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
    retry: 1,
  });

  if (isLoading || isChecking) {
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error loading audit logs</p>
          <p className="text-sm">{(error as any)?.response?.data?.message || "Please try again later"}</p>
        </div>
      </div>
    );
  }

  const logs = data?.data?.logs || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const getActionBadgeColor = (action: string) => {
    if (action.includes("BLOCKED")) return "bg-red-100 text-red-800";
    if (action.includes("UNBLOCKED")) return "bg-green-100 text-green-800";
    if (action.includes("RESOLVED")) return "bg-blue-100 text-blue-800";
    if (action.includes("MODERATION")) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Audit Logs</h1>
          <p className="text-gray-500 text-sm">Immutable history of administrative actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
            <select
              value={filters.targetType}
              onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="USER">User</option>
              <option value="POST">Post</option>
              <option value="COMMENT">Comment</option>
              <option value="PROJECT">Project</option>
              <option value="HUB">Hub</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
            <input
              type="text"
              placeholder="Search by Admin ID..."
              value={filters.adminId}
              onChange={(e) => setFilters({ ...filters, adminId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setFilters({ adminId: "", targetType: "all" }); setPage(1); }}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason/Resolution</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{log.admin?.username || "System"}</span>
                        <span className="text-xs text-gray-400 font-mono">{log.adminId?.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.targetType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono">
                      {log.targetId?.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {log.reason || "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-700">
            Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to <span className="font-semibold">{Math.min(page * limit, total)}</span> of <span className="font-semibold">{total}</span> logs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium text-sm"
            >
              Previous
            </button>
            <div className="flex items-center px-4 text-sm font-medium text-gray-600">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 font-medium text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
