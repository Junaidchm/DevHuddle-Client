"use client"

import React from "react";
import { SettingsTab } from "../../(app)/profile/update/[username]/components";
import showLogoutConfirmation from "@/src/utils/showLogoutConfirmation";
import { useAdminRedirectIfNotAuthenticated } from "@/src/customHooks/useAdminAuthenticated";


const AdminDashboard: React.FC = () => {


  useAdminRedirectIfNotAuthenticated("/admin/signIn")

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
                  <p className="text-gray-500 text-sm">8 items need review</p>
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
                  12,493
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>12% from last month</span>
                </div>
                <canvas
                  className="absolute bottom-0 left-0 w-full h-[50px] opacity-20 transition-opacity duration-300 hover:opacity-50"
                  id="users-sparkline"
                ></canvas>
                <a
                  href="#"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              {/* Hubs Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Domain Hubs
                  </h3>
                  <i className="fas fa-layer-group text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">87</div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>5% from last month</span>
                </div>
                <canvas
                  className="absolute bottom-0 left-0 w-full h-[50px] opacity-20 transition-opacity duration-300 hover:opacity-50"
                  id="hubs-sparkline"
                ></canvas>
                <a
                  href="#"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              {/* Events Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Active Events
                  </h3>
                  <i className="fas fa-calendar-alt text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">29</div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>18% from last month</span>
                </div>
                <canvas
                  className="absolute bottom-0 left-0 w-full h-[50px] opacity-20 transition-opacity duration-300 hover:opacity-50"
                  id="events-sparkline"
                ></canvas>
                <a
                  href="#"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              {/* Ideas Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Ideas Submitted
                  </h3>
                  <i className="fas fa-lightbulb text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">164</div>
                <div className="flex items-center gap-2 text-sm text-emerald-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>7% from last month</span>
                </div>
                <canvas
                  className="absolute bottom-0 left-0 w-full h-[50px] opacity-20 transition-opacity duration-300 hover:opacity-50"
                  id="ideas-sparkline"
                ></canvas>
                <a
                  href="#"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              {/* Sessions Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Room Sessions
                  </h3>
                  <i className="fas fa-video text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">382</div>
                <div className="flex items-center gap-2 text-sm text-red-500 mb-4">
                  <i className="fas fa-arrow-down"></i>
                  <span>3% from last month</span>
                </div>
                <canvas
                  className="absolute bottom-0 left-0 w-full h-[50px] opacity-20 transition-opacity duration-300 hover:opacity-50"
                  id="sessions-sparkline"
                ></canvas>
                <a
                  href="#"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
              </div>

              {/* Moderations Card */}
              <div className="bg-white rounded-2xl p-6 shadow relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-base text-gray-500">
                    Pending Moderations
                  </h3>
                  <i className="fas fa-flag text-xl text-indigo-600 opacity-80"></i>
                </div>
                <div className="text-4xl font-bold mb-2 text-gray-900">18</div>
                <div className="flex items-center gap-2 text-sm text-red-500 mb-4">
                  <i className="fas fa-arrow-up"></i>
                  <span>42% from last month</span>
                </div>
                <canvas
                  className="absolute bottom-0 left-0 w-full h-[50px] opacity-20 transition-opacity duration-300 hover:opacity-50"
                  id="moderations-sparkline"
                ></canvas>
                <a
                  href="#"
                  className="mt-auto flex items-center justify-end gap-2 text-indigo-600 font-medium text-sm pt-4 border-t border-gray-200"
                >
                  <span>View Details</span>
                  <i className="fas fa-arrow-right"></i>
                </a>
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
                <a
                  href="#"
                  className="flex items-center gap-3 p-4 rounded-xl font-medium transition-all duration-300 border border-red-500 text-white bg-red-500 hover:bg-red-600"
                >
                  <i className="fas fa-flag w-5 text-center"></i>
                  <span>Review Flags</span>
                </a>
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
