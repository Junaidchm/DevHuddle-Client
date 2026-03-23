"use client";

import React from "react";
import { useAdminRedirectIfNotAuthenticated } from "@/src/customHooks/useAdminAuthenticated";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/src/services/api/admin-panel.service";
import { useSession } from "next-auth/react";
import { useApiClient } from "@/src/lib/api-client";
import Link from "next/link";

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  icon,
  iconColor,
  href,
  isLoading,
  highlight,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: string;
  iconColor: string;
  href?: string;
  isLoading: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm flex flex-col border transition-all duration-200 hover:-translate-y-0.5 hover:shadow ${
        highlight ? "border-red-200" : "border-transparent"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="font-medium text-sm text-gray-500">{title}</p>
        <span className={`text-xl ${iconColor} opacity-75`}>
          <i className={icon}></i>
        </span>
      </div>
      <p className="text-4xl font-bold text-gray-900 mb-1">
        {isLoading ? (
          <span className="inline-block w-16 h-8 bg-gray-100 rounded animate-pulse"></span>
        ) : (
          value
        )}
      </p>
      {sub && (
        <p
          className={`text-xs mb-4 ${
            highlight ? "text-red-500" : "text-gray-400"
          }`}
        >
          {sub}
        </p>
      )}
      {href && (
        <Link
          href={href}
          className="mt-auto flex items-center justify-end gap-1.5 text-indigo-600 font-medium text-xs pt-4 border-t border-gray-100 hover:text-indigo-700"
        >
          View Details <i className="fas fa-arrow-right text-[10px]"></i>
        </Link>
      )}
    </div>
  );
}

// ─── Quick Action ─────────────────────────────────────────────────────────────

function QuickAction({
  href,
  icon,
  label,
  variant,
}: {
  href: string;
  icon: string;
  label: string;
  variant: "primary" | "secondary" | "warning" | "neutral";
}) {
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent",
    secondary: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-100",
    warning: "bg-red-50 hover:bg-red-100 text-red-700 border-red-100",
    neutral: "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-100",
  };

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 border ${styles[variant]}`}
    >
      <i className={`${icon} w-4 text-center`}></i>
      <span>{label}</span>
    </Link>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const { isChecking } = useAdminRedirectIfNotAuthenticated("/admin/signIn");
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });

  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard-stats", userId, userRole],
    queryFn: () =>
      getDashboardStats(apiClient.getHeaders() as Record<string, string>),
    refetchInterval: 60_000,
    enabled:
      status !== "loading" &&
      !!userId &&
      userRole === "superAdmin" &&
      apiClient.isReady,
  });

  const stats = data?.data || {
    users: { total: 0, active: 0, blocked: 0, newThisMonth: 0 },
    posts: { total: 0 },
    projects: { total: 0 },
    hubs: { total: 0 },
    comments: { total: 0 },
    reports: { total: 0, pending: 0, investigating: 0, critical: 0 },
  };

  if (error && !isLoading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
          <div>
            <p className="text-red-800 font-medium text-sm">
              Failed to load dashboard
            </p>
            <p className="text-red-600 text-xs mt-1">
              {(error as any)?.response?.data?.message ||
                "Could not fetch statistics from server."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Moderation overview — real-time platform statistics
        </p>
      </div>

      {/* Pending Reports Alert */}
      {!isLoading && stats.reports.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <i className="fas fa-flag text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-amber-800 font-medium text-sm">
              {stats.reports.pending} report
              {stats.reports.pending !== 1 ? "s" : ""} need review
            </p>
            {stats.reports.critical > 0 && (
              <p className="text-amber-600 text-xs">
                {stats.reports.critical} marked critical
              </p>
            )}
          </div>
          <Link
            href="/admin/reports"
            className="text-amber-700 font-semibold text-sm hover:text-amber-900 whitespace-nowrap"
          >
            Review →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Users"
          value={stats.users.total.toLocaleString()}
          sub={`${stats.users.newThisMonth || 0} joined this month`}
          icon="fas fa-users"
          iconColor="text-indigo-600"
          href="/admin/users"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Posts"
          value={stats.posts.total.toLocaleString()}
          icon="fas fa-file-alt"
          iconColor="text-blue-500"
          href="/admin/posts"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Projects"
          value={(stats.projects?.total || 0).toLocaleString()}
          icon="fas fa-project-diagram"
          iconColor="text-teal-500"
          href="/admin/projects"
          isLoading={isLoading}
        />
        <StatCard
          title="Domain Hubs"
          value={(stats.hubs?.total || 0).toLocaleString()}
          icon="fas fa-layer-group"
          iconColor="text-purple-500"
          href="/admin/hubs"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending Reports"
          value={stats.reports.pending}
          sub={stats.reports.critical > 0 ? `${stats.reports.critical} critical` : undefined}
          icon="fas fa-flag"
          iconColor="text-red-500"
          href="/admin/reports"
          isLoading={isLoading}
          highlight={stats.reports.pending > 0}
        />
        <StatCard
          title="Under Review"
          value={stats.reports.investigating || 0}
          sub="Reports being processed"
          icon="fas fa-search"
          iconColor="text-amber-500"
          href="/admin/reports"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="flex flex-col gap-2">
            <QuickAction
              href="/admin/reports"
              icon="fas fa-flag"
              label="Review Pending Reports"
              variant="primary"
            />
            <QuickAction
              href="/admin/users"
              icon="fas fa-users"
              label="Manage Users"
              variant="secondary"
            />
            <QuickAction
              href="/admin/posts"
              icon="fas fa-file-alt"
              label="Moderate Posts"
              variant="secondary"
            />
            <QuickAction
              href="/admin/audit-logs"
              icon="fas fa-history"
              label="View Audit Logs"
              variant="neutral"
            />
          </div>
        </div>

        {/* Report Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-transparent">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Report Summary
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Pending",
                value: stats.reports.pending,
                color: "bg-amber-500",
                total: stats.reports.total,
              },
              {
                label: "Under Review",
                value: stats.reports.investigating || 0,
                color: "bg-blue-500",
                total: stats.reports.total,
              },
              {
                label: "Resolved",
                value: stats.reports.resolved || 0,
                color: "bg-green-500",
                total: stats.reports.total,
              },
            ].map(({ label, value, color, total }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{
                      width:
                        total > 0
                          ? `${Math.round((value / total) * 100)}%`
                          : "0%",
                    }}
                  ></div>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100">
              <Link
                href="/admin/reports"
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
              >
                View all reports →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
