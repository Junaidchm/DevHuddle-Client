"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReportById, takeReportAction } from "@/src/services/api/admin-panel.service";
import { useApiClient } from "@/src/lib/api-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useState } from "react";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const [resolution, setResolution] = useState("");
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"APPROVE" | "REMOVE" | "IGNORE" | null>(null);
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  
  // ✅ FIXED: Stable query key using userId/role instead of token
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-report", reportId, userId, userRole],
    queryFn: () => {
      const headers = apiClient.getHeaders();
      // Only pass headers if Authorization is present
      const authHeaders: Record<string, string> | undefined = headers.Authorization 
        ? { Authorization: headers.Authorization } 
        : undefined;
      return getReportById(reportId, authHeaders);
    },
    enabled: status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  const actionMutation = useMutation({
    mutationFn: (data: { action: string; resolution?: string; hideContent?: boolean }) => {
      const headers = apiClient.getHeaders();
      console.log("Taking report action:", { reportId, data, headers });
      // Only pass headers if Authorization is present
      const authHeaders: Record<string, string> | undefined = headers.Authorization 
        ? { Authorization: headers.Authorization } 
        : undefined;
      return takeReportAction(reportId, data as any, authHeaders);
    },
    onSuccess: (response) => {
      console.log("Report action success:", response);
      toast.success("Action completed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-report", reportId] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      setShowActionModal(false);
      setResolution("");
      setActionType(null);
      // Refresh the page data instead of redirecting
      router.refresh();
    },
    onError: (error: any) => {
      console.error("Report action error:", error);
      
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error("Request timed out. The action may still be processing. Please refresh the page to check the status.", {
          duration: 6000,
        });
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: ["admin-report", reportId] });
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
      
      // Handle other errors
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to take action";
      toast.error(errorMessage, {
        duration: 5000,
      });
    },
  });

  const handleAction = () => {
    if (!actionType) {
      toast.error("Please select an action");
      return;
    }
    
    if (!apiClient.isReady) {
      toast.error("Please wait, authentication is not ready");
      return;
    }
    
    if (!apiClient.getHeaders().Authorization) {
      toast.error("Authentication required. Please log in again.");
      return;
    }
    
    actionMutation.mutate({
      action: actionType,
      resolution: resolution || undefined,
      hideContent: actionType === "REMOVE",
    });
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

  if (error || !data?.data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading report. Please try again.</p>
        </div>
      </div>
    );
  }

  const report = data.data;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Report Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Report Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
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
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Severity</label>
                <div className="mt-1">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
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
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Reason</label>
                <p className="mt-1 text-sm text-gray-900">{report.reason}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Target Type</label>
                <p className="mt-1 text-sm text-gray-900">{report.targetType}</p>
              </div>
              {report.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{report.description}</p>
                </div>
              )}
              {report.resolution && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Resolution</label>
                  <p className="mt-1 text-sm text-gray-900">{report.resolution}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Reported Content */}
          {report.Post && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Reported Post</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Post ID</label>
                  <p className="mt-1 text-sm text-gray-900">{report.Post.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Content</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {report.Post.content}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Reports Count</label>
                  <p className="mt-1 text-sm text-gray-900">{report.Post.reportsCount || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hidden</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {report.Post.isHidden ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {report.Comment && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Reported Comment</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Comment ID</label>
                  <p className="mt-1 text-sm text-gray-900">{report.Comment.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Content</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {report.Comment.content}
                  </p>
                </div>
                {report.Comment.Post && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Parent Post</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {report.Comment.Post.content?.substring(0, 100)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            {(report.status === "PENDING" || report.status === "OPEN") && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setActionType("APPROVE");
                    setShowActionModal(true);
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve Report
                </button>
                <button
                  onClick={() => {
                    setActionType("REMOVE");
                    setShowActionModal(true);
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Remove Content
                </button>
                <button
                  onClick={() => {
                    setActionType("IGNORE");
                    setShowActionModal(true);
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Ignore Report
                </button>
              </div>
            )}
            {report.status?.startsWith("RESOLVED_") && (
              <div className="text-sm text-gray-500">
                <p>This report has been resolved.</p>
                {report.reviewedAt && (
                  <p className="mt-2">
                    Reviewed: {new Date(report.reviewedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => {
          if (!actionMutation.isPending) {
            setShowActionModal(false);
            setResolution("");
            setActionType(null);
          }
        }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">
              {actionType === "APPROVE" && "Approve Report"}
              {actionType === "REMOVE" && "Remove Content"}
              {actionType === "IGNORE" && "Ignore Report"}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resolution Notes (Optional)
              </label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={4}
                placeholder="Add notes about this action..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAction}
                disabled={actionMutation.isPending || !actionType}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionMutation.isPending ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={() => {
                  if (!actionMutation.isPending) {
                    setShowActionModal(false);
                    setResolution("");
                    setActionType(null);
                  }
                }}
                disabled={actionMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

