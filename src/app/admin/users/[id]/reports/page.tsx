"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getUserReportsHistory } from "@/src/services/api/admin-panel.service";
import Link from "next/link";

export default function UserReportsHistoryPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-user-reports", userId],
    queryFn: () => getUserReportsHistory(userId),
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
          <p className="text-red-800">Error loading reports. Please try again.</p>
        </div>
      </div>
    );
  }

  const reports = data.data || [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">User Reports History</h1>
        <span className="text-sm text-gray-500">({reports.length} reports)</span>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
            {reports.map((report: any) => (
              <tr key={report.id} className="hover:bg-gray-50">
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
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No reports found for this user.
          </div>
        )}
      </div>
    </div>
  );
}

