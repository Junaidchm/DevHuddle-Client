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
    queryFn: () => getHubById(hubId, apiClient.getHeaders()),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const { data: reportData } = useQuery({
    queryKey: ["admin-hub-reports", hubId, userId, userRole],
    queryFn: () =>
      Promise.all([
        getReports(
          {
            page: 1,
            limit: 5,
            targetType: "HUB",
            search: hubId,
            sortBy: "createdAt",
          },
          apiClient.getHeaders()
        ),
        getReports(
          {
            page: 1,
            limit: 5,
            targetType: "CONVERSATION",
            search: hubId,
            sortBy: "createdAt",
          },
          apiClient.getHeaders()
        ),
      ]),
    enabled:
      status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ suspended, reason }: { suspended: boolean; reason?: string }) =>
      suspendHub(hubId, { suspended, reason }, apiClient.getHeaders()),
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
    mutationFn: () => deleteHubAdmin(hubId, apiClient.getHeaders()),
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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Hub Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Hub Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {hub.icon ? (
                  <img src={hub.icon} alt={hub.name || "Hub"} className="w-14 h-14 rounded-xl object-cover bg-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-lg">
                    {(hub.name || "H").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{hub.name || "Unnamed Hub"}</h3>
                  <p className="text-xs text-gray-500 font-mono">ID: {hub.id}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {hub.description || "No description"}
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={hub.isSuspended ? "suspended" : hub.reportsCount > 0 ? "reported" : "active"} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Members</label>
                  <p className="mt-1 text-sm text-gray-900">{hub.memberCount || hub.participants?.length || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reports</label>
                  <p className="mt-1 text-sm text-gray-900">{hub.reportsCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Owner ID</label>
                  <p className="mt-1 text-sm text-gray-900">{hub.ownerId || "-"}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p className="mt-1 text-sm text-gray-900">
                  {hub.createdAt ? new Date(hub.createdAt).toLocaleString() : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
            {hubReports.length === 0 ? (
              <p className="text-sm text-gray-500">No report records found for this hub.</p>
            ) : (
              <div className="space-y-3">
                {hubReports.map((report: any) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-gray-900 font-medium">{report.reason}</div>
                      <div className="text-xs text-gray-500">{report.status}</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                    <Link
                      href={`/admin/reports/${report.id}`}
                      className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
                    >
                      Open report
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Moderation Actions</h2>
            <div className="space-y-3">
              {hub.isSuspended ? (
                <button
                  onClick={() => suspendMutation.mutate({ suspended: false })}
                  disabled={suspendMutation.isPending}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Unsuspend Hub
                </button>
              ) : (
                <button
                  onClick={() => setSuspendModal(true)}
                  disabled={suspendMutation.isPending}
                  className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  Suspend Hub
                </button>
              )}
              <button
                onClick={() => setDeleteModal(true)}
                disabled={deleteMutation.isPending}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Remove Hub
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={suspendModal}
        onClose={() => setSuspendModal(false)}
        onConfirm={(reason) => suspendMutation.mutate({ suspended: true, reason })}
        title="Suspend Hub"
        message="Suspended hubs remain stored but are removed from active user participation. Add a moderation reason."
        confirmLabel="Suspend Hub"
        confirmVariant="warning"
        reasonRequired={true}
        isLoading={suspendMutation.isPending}
      />

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Remove Hub"
        message="This action permanently removes hub visibility and related participation access."
        confirmLabel="Remove Hub"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
