"use client"

import React from "react";
import { SettingsTab } from "../../(app)/profile/update/[username]/components";
import { useAdminRedirectIfNotAuthenticated } from "@/src/customHooks/useAdminAuthenticated";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/src/services/api/admin-panel.service";
import { useSession } from "next-auth/react";
import { useApiClient } from "@/src/lib/api-client";
import Link from "next/link";


const AdminDashboard: React.FC = () => {
  const { isChecking } = useAdminRedirectIfNotAuthenticated("/admin/signIn");
  const { data: session, status } = useSession();
  const apiClient = useApiClient({ requireAuth: true });
  
  // ✅ FIXED: Stable query key using userId/role instead of token
  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard-stats", userId, userRole],
    queryFn: () => getDashboardStats(apiClient.getHeaders()),
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: status !== "loading" && !!userId && userRole === "superAdmin" && apiClient.isReady,
  });

  // Default stats structure for loading/error states
  const stats = data?.data || {
    users: { total: 0, active: 0, blocked: 0, newToday: 0, newThisWeek: 0, newThisMonth: 0 },
    posts: { total: 0, reported: 0, hidden: 0, deleted: 0, createdToday: 0, createdThisWeek: 0, createdThisMonth: 0 },
    comments: { total: 0, reported: 0, deleted: 0, createdToday: 0 },
    reports: { total: 0, pending: 0, open: 0, investigating: 0, resolved: 0, critical: 0, high: 0, createdToday: 0, createdThisWeek: 0 },
    engagement: { totalLikes: 0, totalComments: 0, totalShares: 0 },
  };

  // Show error state if query fails
  if (error && !isLoading) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <i className="fas fa-exclamation-circle text-red-600"></i>
            <p className="text-red-800 font-medium">Error loading dashboard</p>
          </div>
          <p className="text-red-700 text-sm">
            {(error as any)?.response?.data?.message || "Failed to load dashboard statistics"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
       <div className="p-6 flex flex-col gap-6">
          {/* System alerts card */}
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                System Status
              </h2>
              <button className="text-indigo-600 font-medium text-sm flex items-center gap-2">
                View All <i className="fas fa-arrow-right"></i>
              </button>
            </div>
            <div className="flex gap-4 max-md:flex-col">
              <div className="flex-1 bg-gray-100 rounded-xl p-4 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="w-[42px] h-[42px] rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[0.95rem] mb-1">
                    System Health
                  </h3>
                  <p className="text-gray-500 text-sm">
                    All systems operational
                  </p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  Just now
                </span>
              </div>
              <div className="flex-1 bg-gray-100 rounded-xl p-4 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="w-[42px] h-[42px] rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[0.95rem] mb-1">
                    Flagged Content
                  </h3>
                  <p className="text-gray-500 text-sm">{stats.reports.pending} items need review</p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  2 hours ago
                </span>
              </div>
              <div className="flex-1 bg-gray-100 rounded-xl p-4 flex items-center gap-3 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="w-[42px] h-[42px] rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xl">
                  <i className="fas fa-times-circle"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[0.95rem] mb-1">
                    Failed Logins
                  </h3>
                  <p className="text-gray-500 text-sm">
                    3 suspicious login attempts
                  </p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  Yesterday
                </span>
              </div>
            </div>
          </div>

          {/* Dashboard layout */}
          <div className="flex gap-6 max-xl:flex-col">
            <div className="grid grid-cols-3 gap-6 flex-1 max-lg:grid-cols-2 max-md:grid-cols-1">
              {/* Total Users Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Total Users
                  </h3>
                  <i className="fas fa-users text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">
                  {isLoading ? "..." : stats.users.total.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>{stats.users.newThisMonth} new this month</span>
                </div>
                <canvas
                  className="absolute bottom-0 left-0 w-full h-[50px] opacity-20 transition-opacity duration-300 hover:opacity-50"
                  id="users-sparkline"
                ></canvas>
                <Link
                  href="/admin/users"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200 hover:text-indigo-700"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              {/* Hubs Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Domain Hubs
                  </h3>
                  <i className="fas fa-layer-group text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">
                  {isLoading ? "..." : stats.posts.total.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>{stats.posts.createdThisMonth} created this month</span>
                </div>
                <Link
                  href="/admin/posts"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              {/* Comments Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Total Comments
                  </h3>
                  <i className="fas fa-comments text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">
                  {isLoading ? "..." : stats.comments.total.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>{stats.comments.createdToday} created today</span>
                </div>
                <Link
                  href="/admin/comments"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              {/* Engagement Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Total Engagement
                  </h3>
                  <i className="fas fa-heart text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">
                  {isLoading ? "..." : stats.engagement.totalLikes.toLocaleString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>{stats.engagement.totalShares} shares</span>
                </div>
              </div>

              {/* Reports Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Pending Reports
                  </h3>
                  <i className="fas fa-flag text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">
                  {isLoading ? "..." : stats.reports.pending}
                </div>
                <div className="flex items-center gap-2 text-sm text-red-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>{stats.reports.critical} critical</span>
                </div>
                <Link
                  href="/admin/reports"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* Quick actions panel */}
            <div className="w-[280px] bg-white rounded-2xl p-6 shadow max-xl:w-full">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">
                Quick Actions
              </h3>
              <div className="flex flex-col gap-3 max-xl:grid max-xl:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 border border-gray-200 text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <i className="fas fa-plus w-5 text-center"></i>
                  <span>Create Hub</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 border border-blue-600 text-white bg-blue-600 hover:bg-blue-700"
                >
                  <i className="fas fa-calendar-plus w-5 text-center"></i>
                  <span>Create Event</span>
                </a>
                <Link
                  href="/admin/reports"
                  className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 border border-red-500 text-white bg-red-500 hover:bg-red-600"
                >
                  <i className="fas fa-flag w-5 text-center"></i>
                  <span>Review Flags</span>
                </Link>
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 border border-gray-200 text-gray-900 hover:translate-x-1"
                >
                  <i className="fas fa-cog w-5 text-center"></i>
                  <span>Settings</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 border border-gray-200 text-gray-900 hover:translate-x-1"
                >
                  <i className="fas fa-bell w-5 text-center"></i>
                  <span>Notifications</span>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 border border-gray-200 text-gray-900 hover:translate-x-1"
                >
                  <i className="fas fa-user-plus w-5 text-center"></i>
                  <span>Add Admin</span>
                </a>
              </div>
            </div>
          </div>

          {/* Recent activity section */}
          <div className="bg-white rounded-2xl p-6 shadow">
            <h2 className="text-lg font-semibold mb-6 text-gray-900">
              Recent Activity
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="w-[42px] h-[42px] rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center text-xl">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[0.95rem] mb-1">
                    New User Registration
                  </div>
                  <div className="text-gray-500 text-sm mb-2">
                    Jane Cooper registered an account
                  </div>
                  <div className="text-gray-400 text-xs">5 minutes ago</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 bg-white transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                    aria-label="View user"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="w-[42px] h-[42px] rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center text-xl">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[0.95rem] mb-1">
                    New Idea Submitted
                  </div>
                  <div className="text-gray-500 text-sm mb-2">
                    Michael Scott submitted "AI-powered code review tool"
                  </div>
                  <div className="text-gray-400 text-xs">1 hour ago</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 bg-white transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                    aria-label="View idea"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-100 transition-transform duration-300 hover:-translate-y-0.5">
                <div className="w-[42px] h-[42px] rounded-full bg-indigo-600/10 text-indigo-600 flex items-center justify-center text-xl">
                  <i className="fas fa-flag"></i>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[0.95rem] mb-1">
                    Content Flagged
                  </div>
                  <div className="text-gray-500 text-sm mb-2">
                    A post in "React Hub" was flagged for review
                  </div>
                  <div className="text-gray-400 text-xs">2 hours ago</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 bg-white transition-all duration-300 hover:bg-indigo-600 hover:text-white"
                    aria-label="View flagged content"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                </div>
              </div>
            </div>
            <a
              href="#"
              className="mt-6 inline-block text-indigo-600 font-medium text-sm"
            >
              View All Activity
            </a>
          </div>
        </div>

      
    </>
  );
};

export default AdminDashboard;
