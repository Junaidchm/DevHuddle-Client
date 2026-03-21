"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bulkReportAction,
  getReports,
  getDashboardStats,
  takeReportAction,
} from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Card } from "@/src/components/admin/ui/Card";
import { CardHeader } from "@/src/components/admin/ui/CardHeader";
import { SearchInput } from "@/src/components/admin/ui/SearchInput";
import { FilterBar } from "@/src/components/admin/ui/FilterBar";
import { FilterSelect } from "@/src/components/admin/ui/FilterSelect";
import ConfirmModal from "@/src/components/admin/ui/ConfirmModal";
import {
  ADMIN_REPORT_REASONS,
  ADMIN_REPORT_SEVERITIES,
  ADMIN_REPORT_TARGET_TYPES,
  ADMIN_REPORT_STATUSES,
  AdminModerationAction,
  AdminReportRecord,
  isReportActionable,
  mapModerationActionToPayload,
} from "@/src/lib/admin-moderation";
import useDebounce from "@/src/customHooks/useDebounce";

type ActionModalState = {
  isOpen: boolean;
  action: AdminModerationAction | null;
  reportId: string | null;
  targetType: string | null;
  mode: "single" | "bulk";
};

function statusBadgeClasses(status: string): string {
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800";
  if (status === "INVESTIGATING") return "bg-blue-100 text-blue-800";
  if (status === "RESOLVED_REMOVED") return "bg-red-100 text-red-700";
  if (status === "RESOLVED_APPROVED") return "bg-green-100 text-green-700";
  if (status === "RESOLVED_IGNORED") return "bg-gray-100 text-gray-700";
  if (status === "CLOSED") return "bg-slate-100 text-slate-700";
  return "bg-gray-100 text-gray-700";
}

function severityBadgeClasses(severity: string): string {
  if (severity === "CRITICAL") return "bg-red-100 text-red-800";
  if (severity === "HIGH") return "bg-orange-100 text-orange-800";
  if (severity === "MEDIUM") return "bg-yellow-100 text-yellow-800";
  return "bg-gray-100 text-gray-700";
}

const getTargetLink = (targetType: string, targetId: string) => {
  switch (targetType) {
    case "POST":
      return `/admin/posts/${targetId}`;
    case "COMMENT":
      return `/admin/comments?id=${targetId}`;
    case "PROJECT":
      return `/admin/projects/${targetId}`;
    case "HUB":
    case "CONVERSATION":
      return `/admin/hubs/${targetId}`;
    case "USER":
      return `/admin/users/${targetId}`;
    case "MESSAGE":
      return `/admin/hubs/${targetId}/messages`; // Hypothetical route
    default:
      return null;
  }
};

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  const queryClient = useQueryClient();

  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    targetType: "all",
    severity: "all",
    reason: "all",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [actionModal, setActionModal] = useState<ActionModalState>({
    isOpen: false,
    action: null,
    reportId: null,
    targetType: null,
    mode: "single",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "admin-reports",
      page,
      limit,
      debouncedSearch,
      filters.status,
      filters.targetType,
      filters.severity,
      filters.reason,
      filters.sortBy,
      filters.sortOrder,
      userId,
      userRole,
    ],
    queryFn: () =>
      getReports(
        {
          page,
          limit,
          search: debouncedSearch || undefined,
          status: filters.status,
          targetType: filters.targetType,
          severity: filters.severity,
          reason: filters.reason,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        },
        apiClient.getHeaders() as any
      ),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
    refetchInterval: 45_000,
  });

  // Fetch global stats for the cards
  const { data: statsData } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => getDashboardStats(apiClient.getHeaders() as any),
    enabled: apiClient.isReady && userRole === "superAdmin",
  });

  const reports: AdminReportRecord[] = data?.data?.reports || [];
  const totalPages = data?.data?.totalPages || 1;
  const total = data?.data?.total || 0;

  // Use global stats if available, otherwise fallback to local page calculation
  const summary = statsData?.data?.reports 
    ? {
        pending: statsData.data.reports.pending || 0,
        investigating: statsData.data.reports.investigating || 0,
        critical: statsData.data.reports.critical || 0,
      }
    : reports.reduce(
        (acc, report) => {
          if (report.status === "PENDING") acc.pending += 1;
          if (report.status === "INVESTIGATING") acc.investigating += 1;
          if (report.severity === "CRITICAL") acc.critical += 1;
          return acc;
        },
        { pending: 0, investigating: 0, critical: 0 }
      );

  const actionMutation = useMutation({
    mutationFn: ({
      reportId,
      action,
      targetType,
      resolution,
    }: {
      reportId: string;
      action: AdminModerationAction;
      targetType: string;
      resolution: string;
    }) => {
      const payload = mapModerationActionToPayload(action, targetType, resolution);
      return takeReportAction(reportId, payload, apiClient.getHeaders() as any);
    },
    onSuccess: () => {
      toast.success("Report action applied");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      setSelectedReports([]);
      setActionModal({ isOpen: false, action: null, reportId: null, targetType: null, mode: "single" });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to process report action";
      toast.error(message);
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({
      action,
      resolution,
    }: {
      action: AdminModerationAction;
      resolution?: string;
    }) =>
      bulkReportAction(
        {
          reportIds: selectedReports,
          action,
          resolution,
        },
        apiClient.getHeaders() as any
      ),
    onSuccess: () => {
      toast.success("Bulk moderation action completed");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      setSelectedReports([]);
      setActionModal({ isOpen: false, action: null, reportId: null, targetType: null, mode: "single" });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to process bulk action";
      toast.error(message);
    },
  });

  const toggleSelectReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]
    );
  };

  const toggleSelectAll = () => {
    if (reports.length === 0) return;
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
      return;
    }
    setSelectedReports(reports.map((report) => report.id));
  };

  const openSingleAction = (report: AdminReportRecord, action: AdminModerationAction) => {
    setActionModal({
      isOpen: true,
      action,
      reportId: report.id,
      targetType: report.targetType,
      mode: "single",
    });
  };

  const openBulkAction = (action: AdminModerationAction) => {
    if (selectedReports.length === 0) {
      toast.error("Select at least one report first");
      return;
    }
    setActionModal({
      isOpen: true,
      action,
      reportId: null,
      targetType: null,
      mode: "bulk",
    });
  };

  const handleActionConfirm = (resolution?: string) => {
    if (!actionModal.action) return;
    const moderationNote = resolution?.trim();
    if (!moderationNote) return;

    if (actionModal.mode === "bulk") {
      bulkActionMutation.mutate({ action: actionModal.action, resolution: moderationNote });
      return;
    }

    if (!actionModal.reportId || !actionModal.targetType) return;
    actionMutation.mutate({
      reportId: actionModal.reportId,
      action: actionModal.action,
      targetType: actionModal.targetType,
      resolution: moderationNote,
    });
  };

  const handleClearFilters = () => {
    setPage(1);
    setFilters({
      search: "",
      status: "all",
      targetType: "all",
      severity: "all",
      reason: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSelectedReports([]);
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
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading reports</p>
          <p className="text-red-600 text-sm mt-1">
            {(error as any)?.response?.data?.message || "Please try again"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full h-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-500 flex-shrink-0">
            <i className="fas fa-clock"></i>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
            <p className="text-2xl font-black text-gray-900">{summary.pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
            <i className="fas fa-magnifying-glass"></i>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Investigating</p>
            <p className="text-2xl font-black text-gray-900">{summary.investigating}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
            <i className="fas fa-circle-exclamation"></i>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Critical</p>
            <p className="text-2xl font-black text-red-700">{summary.critical}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader title="Reports Management">
          <SearchInput
            placeholder="Search target ID / reporter ID / description..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
        </CardHeader>

        <div className="overflow-x-auto">
          <FilterBar onClearFilters={handleClearFilters}>
            <FilterSelect
              id="report-status-filter"
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              options={[
                { label: "All Status", value: "all" },
                ...ADMIN_REPORT_STATUSES.map((status) => ({ label: status, value: status })),
              ]}
            />

            <FilterSelect
              id="report-target-filter"
              label="Target Type"
              value={filters.targetType}
              onChange={(e) => setFilters((prev) => ({ ...prev, targetType: e.target.value }))}
              options={[
                { label: "All Targets", value: "all" },
                ...ADMIN_REPORT_TARGET_TYPES.map((target) => ({ label: target, value: target })),
              ]}
            />

            <FilterSelect
              id="report-severity-filter"
              label="Severity"
              value={filters.severity}
              onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}
              options={[
                { label: "All Severity", value: "all" },
                ...ADMIN_REPORT_SEVERITIES.map((severity) => ({ label: severity, value: severity })),
              ]}
            />

            <FilterSelect
              id="report-reason-filter"
              label="Reason"
              value={filters.reason}
              onChange={(e) => setFilters((prev) => ({ ...prev, reason: e.target.value }))}
              options={[
                { label: "All Reasons", value: "all" },
                ...ADMIN_REPORT_REASONS.map((reason) => ({ label: reason, value: reason })),
              ]}
            />

            <FilterSelect
              id="report-sort-filter"
              label="Sort By"
              value={filters.sortBy}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
              options={[
                { label: "Created Date", value: "createdAt" },
                { label: "Severity", value: "severity" },
                { label: "Status", value: "status" },
              ]}
            />

            <FilterSelect
              id="report-sort-order-filter"
              label="Order"
              value={filters.sortOrder}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sortOrder: e.target.value as "asc" | "desc" }))
              }
              options={[
                { label: "Descending", value: "desc" },
                { label: "Ascending", value: "asc" },
              ]}
            />
          </FilterBar>

          <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Bulk Actions</span>
            <button
              onClick={() => openBulkAction("APPROVE")}
              disabled={selectedReports.length === 0 || bulkActionMutation.isPending}
              className="flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-check text-[10px]"></i> Approve Selected
            </button>
            <button
              onClick={() => openBulkAction("REMOVE")}
              disabled={selectedReports.length === 0 || bulkActionMutation.isPending}
              className="flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-ban text-[10px]"></i> Remove Selected
            </button>
            <button
              onClick={() => openBulkAction("IGNORE")}
              disabled={selectedReports.length === 0 || bulkActionMutation.isPending}
              className="flex items-center gap-1.5 px-3 h-8 text-xs font-bold rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-minus text-[10px]"></i> Ignore Selected
            </button>
            <span className="text-xs text-gray-400 font-medium ml-auto">
              {selectedReports.length > 0 ? (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded font-bold">{selectedReports.length} selected</span>
              ) : (
                "0 selected"
              )}
            </span>
          </div>

          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr>
                <th className="p-4 bg-gray-100 text-left">
                  <input
                    type="checkbox"
                    checked={reports.length > 0 && selectedReports.length === reports.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  Target
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  Reporter
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  Reason
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  Severity
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  Status
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  Content
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  Created
                </th>
                <th className="p-4 bg-gray-100 text-gray-500 font-semibold text-xs uppercase tracking-wider text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    No reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => toggleSelectReport(report.id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-700">{report.targetType}</span>
                        <span className="text-xs text-gray-500 font-mono">{report.targetId}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-900">
                          {report.reporter?.name || report.reporter?.username || "Unknown"}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">{report.reporterId}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-[220px]">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-gray-700">{report.reason}</span>
                        <span className="text-xs text-gray-500 line-clamp-2">
                          {report.description || "No additional details"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${severityBadgeClasses(report.severity)}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusBadgeClasses(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {getTargetLink(report.targetType, report.targetId) ? (
                        <div className="flex flex-col gap-1.5">
                          <Link
                            href={getTargetLink(report.targetType, report.targetId)!}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
                          >
                            View Entity
                            <i className="fas fa-external-link-alt text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
                          </Link>
                          {!!report.metadata?.contentSnippet && (
                            <span className="text-[11px] text-gray-500 italic line-clamp-1 border-l-2 border-gray-200 pl-2">
                              "{report.metadata.contentSnippet as string}"
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No link available</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/reports/${report.id}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        {isReportActionable(report.status) && (
                          <>
                            <button
                              onClick={() => openSingleAction(report, "APPROVE")}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                              title="Approve"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => openSingleAction(report, "REMOVE")}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                            <button
                              onClick={() => openSingleAction(report, "IGNORE")}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                              title="Ignore"
                            >
                              <i className="fas fa-minus"></i>
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
        </div>

        <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-200 gap-4">
          <div className="flex gap-1">
            <button
              className="w-8 h-8 rounded-md flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-all duration-300 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 w-full sm:w-auto justify-between sm:justify-start">
            <label htmlFor="report-page-size">Show</label>
            <select
              id="report-page-size"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="p-1 border border-gray-200 rounded-md text-sm text-gray-800 bg-white min-w-[70px] outline-none focus:border-indigo-600"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>
        </div>
      </Card>

      <ConfirmModal
        isOpen={actionModal.isOpen}
        onClose={() =>
          setActionModal({ isOpen: false, action: null, reportId: null, targetType: null, mode: "single" })
        }
        onConfirm={handleActionConfirm}
        title={
          actionModal.mode === "bulk"
            ? `${actionModal.action} Selected Reports`
            : `${actionModal.action} Report`
        }
        message={
          actionModal.mode === "bulk"
            ? "This moderation decision will be applied to all selected reports. Add resolution notes for audit."
            : "This moderation decision will be logged in audit history and may trigger enforcement workflows."
        }
        confirmLabel={
          actionModal.mode === "bulk"
            ? `Confirm ${actionModal.action || "Action"} (${selectedReports.length})`
            : `Confirm ${actionModal.action || "Action"}`
        }
        confirmVariant={actionModal.action === "REMOVE" ? "danger" : "primary"}
        reasonRequired={true}
        isLoading={actionMutation.isPending || bulkActionMutation.isPending}
      />
    </div>
  );
}
