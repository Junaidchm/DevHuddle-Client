"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReportById,
  takeReportAction,
} from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";
import ConfirmModal from "@/src/components/admin/ui/ConfirmModal";
import {
  ADMIN_REPORT_REASONS,
  AdminModerationAction,
  AdminReportRecord,
  isReportActionable,
  mapModerationActionToPayload,
} from "@/src/lib/admin-moderation";

function statusBadgeClasses(status: string): string {
  if (status === "PENDING") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (status === "INVESTIGATING") return "bg-blue-100 text-blue-700 border-blue-200";
  if (status === "RESOLVED_REMOVED") return "bg-red-100 text-red-700 border-red-200";
  if (status === "RESOLVED_APPROVED") return "bg-green-100 text-green-700 border-green-200";
  if (status === "RESOLVED_IGNORED") return "bg-gray-100 text-gray-700 border-gray-200";
  if (status === "CLOSED") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function severityConfig(severity: string) {
  if (severity === "CRITICAL") return { cls: "text-red-700", bg: "bg-red-50/50 border-red-100/50", icon: "fa-circle-exclamation" };
  if (severity === "HIGH") return { cls: "text-orange-700", bg: "bg-orange-50/50 border-orange-100/50", icon: "fa-arrow-up" };
  if (severity === "MEDIUM") return { cls: "text-yellow-700", bg: "bg-yellow-50/50 border-yellow-100/50", icon: "fa-minus" };
  return { cls: "text-gray-700", bg: "bg-gray-50 border-gray-100", icon: "fa-arrow-down" };
}

const targetTypeToPath = (targetType: string, targetId: string): string | null => {
  const map: Record<string, string> = {
    POST: `/admin/posts/${targetId}`,
    COMMENT: `/admin/comments?id=${targetId}`,
    PROJECT: `/admin/projects/${targetId}`,
    HUB: `/admin/hubs/${targetId}`,
    CONVERSATION: `/admin/hubs/${targetId}`,
    USER: `/admin/users/${targetId}`,
  };
  return map[targetType] || null;
};

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const queryClient = useQueryClient();

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    action: AdminModerationAction | null;
  }>({ isOpen: false, action: null });

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-report", reportId, userId, userRole],
    queryFn: () => getReportById(reportId, apiClient.getHeaders() as any),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const actionMutation = useMutation({
    mutationFn: ({
      action,
      resolution,
    }: {
      action: AdminModerationAction;
      resolution: string;
    }) => {
      const report: AdminReportRecord = data?.data;
      const payload = mapModerationActionToPayload(action, report.targetType, resolution);
      return takeReportAction(reportId, payload, apiClient.getHeaders() as any);
    },
    onSuccess: () => {
      toast.success("Report action applied");
      queryClient.invalidateQueries({ queryKey: ["admin-report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setActionModal({ isOpen: false, action: null });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to process report action");
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
          <p className="text-red-800">Error loading report details. Please try again.</p>
        </div>
      </div>
    );
  }

  const report: AdminReportRecord = data.data;
  const targetPath = targetTypeToPath(report.targetType, report.targetId);
  const sevConfig = severityConfig(report.severity);
  const actionable = isReportActionable(report.status);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Report Overview */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Report Overview</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${statusBadgeClasses(report.status)}`}
              >
                {report.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-8 space-y-8">
              {/* Reporter & Info Row */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reporter</span>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {report.reporter?.name || report.reporter?.username || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">{report.reporterId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reported On</span>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {new Date(report.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Reason & Description */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reason</span>
                <div className="p-4 bg-white border border-gray-100 rounded-xl">
                  <p className="text-base font-bold text-gray-900 capitalize mb-2">
                    {String(report.reason).replace(/_/g, " ").toLowerCase()}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {(report.description as string) || (
                      <span className="text-gray-400 italic font-normal">No additional details provided.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Reported Content Snapshot */}
              {report.metadata?.contentSnippet && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content Snapshot</span>
                  <div className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400 opacity-50"></div>
                    <p className="text-sm text-gray-800 italic leading-relaxed pl-2">
                       "{String(report.metadata?.contentSnippet || "")}"
                    </p>
                  </div>
                </div>
              )}

              {/* Target Content Link */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direct Link</span>
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-black text-gray-700 uppercase">{report.targetType}</span>
                    <span className="text-xs text-gray-400 font-mono">{report.targetId}</span>
                  </div>
                  {targetPath && (
                    <Link
                      href={targetPath}
                      className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold text-indigo-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 group shadow-sm"
                    >
                      Inspect Entity 
                      <i className="fas fa-external-link-alt text-[10px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"></i>
                    </Link>
                  )}
                </div>
              </div>

              {/* Severity + Status Metrics */}
              <div className="grid grid-cols-3 gap-6">
                <div className={`p-4 rounded-xl border flex flex-col items-center ${sevConfig.bg}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${sevConfig.cls}`}>
                    Severity
                  </span>
                  <i className={`fas ${sevConfig.icon} text-xl ${sevConfig.cls} mb-1`}></i>
                  <span className={`text-sm font-black uppercase ${sevConfig.cls}`}>{report.severity}</span>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Target Type</span>
                  <span className="text-sm font-black text-indigo-700 uppercase">{report.targetType}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reviewer</span>
                  <span className="text-sm font-black text-gray-700">
                    {report.reviewer?.name || report.reviewedById ? "Assigned" : "Unassigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Resolution Notes */}
          {report.resolution && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Resolution Notes</h2>
              </div>
              <div className="p-6">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{report.resolution}</p>
                  {report.resolvedAt && (
                    <p className="text-[10px] text-gray-400 mt-3 font-medium">
                      <i className="far fa-clock mr-1"></i>
                      Resolved at: {new Date(report.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Moderation Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Moderation Hub</h2>
            </div>
            <div className="p-6 space-y-4">
              {actionable ? (
                <>
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                      Current State
                    </span>
                    <div className="text-yellow-700 font-bold text-sm flex items-center gap-2">
                      <i className="fas fa-clock"></i> Awaiting Action
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActionModal({ isOpen: true, action: "APPROVE" })}
                      className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-check"></i> Approve Content
                    </button>
                    <button
                      onClick={() => setActionModal({ isOpen: true, action: "REMOVE" })}
                      className="w-full px-4 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-ban"></i> Remove Content
                    </button>
                    <button
                      onClick={() => setActionModal({ isOpen: true, action: "IGNORE" })}
                      className="w-full px-4 py-3 bg-white text-gray-600 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-minus"></i> Ignore Report
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center">
                  <i className="fas fa-check-circle text-green-500 text-xl mb-2 block"></i>
                  <span className="text-sm font-bold text-gray-700">Report Resolved</span>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">No further actions required</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Info */}
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-md shadow-indigo-100">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-80">Audit Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Report ID</span>
                <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  {reportId.substring(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Target</span>
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded uppercase">
                  {report.targetType}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Last Updated</span>
                <span className="font-bold">
                  {report.updatedAt ? new Date(report.updatedAt).toLocaleDateString() : "-"}
                </span>
              </div>
              {report.reviewedById && (
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-70">Reviewed By</span>
                  <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                    {report.reviewedById.substring(0, 10)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, action: null })}
        onConfirm={(resolution) => {
          if (actionModal.action && resolution) {
            actionMutation.mutate({ action: actionModal.action, resolution });
          }
        }}
        title={`${actionModal.action} Report`}
        message="This moderation decision will be logged in audit history and may trigger enforcement workflows."
        confirmLabel={`Confirm ${actionModal.action || "Action"}`}
        confirmVariant={actionModal.action === "REMOVE" ? "danger" : actionModal.action === "APPROVE" ? "primary" : "warning"}
        reasonRequired={true}
        reasonOptions={ADMIN_REPORT_REASONS.map((r) => ({ label: r, value: r }))}
        isLoading={actionMutation.isPending}
      />
    </div>
  );
}
