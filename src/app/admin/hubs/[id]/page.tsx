"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteHubAdmin,
  getHubById,
  getReports,
  suspendHub,
} from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState } from "react";
import ConfirmModal from "@/src/components/admin/ui/ConfirmModal";
import StatusBadge from "@/src/components/admin/ui/StatusBadge";
import { MODERATION_REASONS } from "@/src/constants/moderation.constants";

export default function HubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const hubId = params.id as string;
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const queryClient = useQueryClient();

  const [suspendModal, setSuspendModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-hub", hubId, userId, userRole],
    queryFn: () => getHubById(hubId, apiClient.getHeaders() as any),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const { data: reportData } = useQuery({
    queryKey: ["admin-hub-reports", hubId, userId, userRole],
    queryFn: () =>
      Promise.all([
        getReports(
          { page: 1, limit: 5, targetType: "HUB", search: hubId, sortBy: "createdAt" },
          apiClient.getHeaders() as any
        ),
        getReports(
          { page: 1, limit: 5, targetType: "CONVERSATION", search: hubId, sortBy: "createdAt" },
          apiClient.getHeaders() as any
        ),
      ]),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ suspended, reason }: { suspended: boolean; reason?: string }) =>
      suspendHub(hubId, { suspended, reason }, apiClient.getHeaders() as any),
    onSuccess: () => {
      toast.success("Hub status updated");
      setSuspendModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-hub", hubId] });
      queryClient.invalidateQueries({ queryKey: ["admin-hubs"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update hub");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteHubAdmin(hubId, apiClient.getHeaders() as any),
    onSuccess: () => {
      toast.success("Hub removed");
      queryClient.invalidateQueries({ queryKey: ["admin-hubs"] });
      router.push("/admin/hubs");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to remove hub");
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
          <p className="text-red-800">Error loading hub details.</p>
        </div>
      </div>
    );
  }

  const hub = data.data;
  const hubReports = [
    ...(reportData?.[0]?.data?.reports || []),
    ...(reportData?.[1]?.data?.reports || []),
  ]
    .filter((report: any) => report.targetId === hub.id)
    .slice(0, 8);

  const isSuspended = !!hub.isSuspended;
  const memberCount = hub.memberCount || hub.participants?.length || 0;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Hub Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hub Overview Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Hub Overview</h2>
              <StatusBadge
                status={isSuspended ? "suspended" : (hub.reportsCount || 0) > 0 ? "reported" : "active"}
              />
            </div>

            <div className="p-8 space-y-8">
              {/* Hub Identity */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  {hub.icon ? (
                    <img
                      src={hub.icon}
                      alt={hub.name || "Hub"}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl">
                      {(hub.name || "H").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Hub Name</span>
                    <h3 className="text-lg font-bold text-gray-900">{hub.name || "Unnamed Hub"}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created On</span>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {hub.createdAt
                      ? new Date(hub.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</span>
                <div className="p-6 bg-white border border-gray-100 rounded-xl">
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {hub.description || (
                      <span className="text-gray-400 italic font-normal">No description provided</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Members</span>
                  <span className="text-2xl font-black text-indigo-700">{memberCount}</span>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Visibility</span>
                  <span className="text-sm font-black text-emerald-700 uppercase">
                    {hub.privacy || "Public"}
                  </span>
                </div>
                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100/50 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Reports</span>
                  <span className="text-2xl font-black text-orange-700">{hub.reportsCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reports Analysis */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Reports Analysis</h2>
              {hubReports.length > 0 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-[10px] font-black uppercase">
                  {hubReports.length} Reports Total
                </span>
              )}
            </div>
            <div className="p-6">
              {hubReports.length > 0 ? (
                <div className="space-y-4">
                  {hubReports.map((report: any) => (
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
                  <p className="text-sm font-medium text-gray-500">No report records found for this hub.</p>
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
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Current State
                </span>
                {isSuspended ? (
                  <div className="text-yellow-700 font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-lock"></i> Hub is Suspended
                  </div>
                ) : (
                  <div className="text-green-700 font-bold text-sm flex items-center gap-2">
                    <i className="fas fa-check-circle"></i> Publicly Active
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {isSuspended ? (
                  <button
                    onClick={() => suspendMutation.mutate({ suspended: false })}
                    disabled={suspendMutation.isPending}
                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <i className="fas fa-unlock"></i> Restore Hub
                  </button>
                ) : (
                  <button
                    onClick={() => setSuspendModal(true)}
                    className="w-full px-4 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-lock"></i> Suspend Hub
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
            </div>
          </div>

          {/* Audit Info */}
          <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-md shadow-indigo-100">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-80">Audit Info</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Hub ID</span>
                <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">
                  {hubId.substring(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Owner ID</span>
                <span className="font-bold bg-white/20 px-2 py-0.5 rounded font-mono">
                  {hub.ownerId ? hub.ownerId.substring(0, 10) + "..." : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-70">Last Updated</span>
                <span className="font-bold">
                  {hub.updatedAt ? new Date(hub.updatedAt).toLocaleDateString() : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={suspendModal}
        onClose={() => setSuspendModal(false)}
        onConfirm={(reason) => suspendMutation.mutate({ suspended: true, reason })}
        title="Suspend Hub"
        message="Suspended hubs are hidden from active participation. Members cannot post until unsuspended. Add a moderation reason."
        confirmLabel="Suspend Hub"
        confirmVariant="warning"
        reasonRequired={true}
        reasonOptions={MODERATION_REASONS}
        isLoading={suspendMutation.isPending}
      />

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Remove Hub"
        message="This action permanently removes hub visibility and all related participation access. This cannot be undone."
        confirmLabel="Delete Permanently"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
