"use client";
import showLogoutConfirmation from "@/src/utils/showLogoutConfirmation";
import "../styles/admin.css";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/store";
import { usePathname, useRouter } from "next/navigation";
import { useAdminRedirectIfNotAuthenticated } from "@/src/customHooks/useAdminAuthenticated";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { SettingsTab } from "../(main)/profile/update/[username]/components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isChecking } = useAdminRedirectIfNotAuthenticated("/admin/signIn");

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-indigo-600 mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (  
    <>
      <div className="flex min-h-screen font-['Inter'] bg-gray-100 text-gray-900 leading-6 overflow-x-hidden">
        {/* Sidebar */}
        <aside className="w-[260px] bg-gray-900 text-gray-50 h-screen fixed z-50 transition-all duration-300 ease-in-out overflow-x-hidden overflow-y-auto flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <i className="fas fa-code text-xl text-indigo-600"></i>
              <span className="font-bold text-xl transition-opacity duration-300">
                DevHuddle
              </span>
            </div>
            <button className="text-gray-400 text-xl transition-colors duration-300 hover:text-gray-50">
              <i className="fas fa-bars"></i>
            </button>
          </div>

          <nav className="flex-1 py-4">
            <div className="mb-4">
              <h3 className="text-xs uppercase text-gray-400 tracking-[0.05em] px-6 py-2 transition-opacity duration-300">
                Dashboard
              </h3>
              <ul>
                <li className="relative">
                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10 ${
                      pathname === "/admin/dashboard" ? "bg-white/10 text-gray-50" : ""
                    }`}
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-chart-line"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Overview
                    </span>
                    {pathname === "/admin/dashboard" && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600"></span>
                    )}
                  </Link>
                </li>
                <li className="relative">
                  <a
                    href="admin-analytics.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-chart-bar"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Analytics
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-xs uppercase text-gray-400 tracking-[0.05em] px-6 py-2 transition-opacity duration-300">
                Management
              </h3>
              <ul>
                <li className="relative">
                  <Link
                    href="/admin/users"
                    className={`flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10 ${
                      pathname?.startsWith("/admin/users") ? "bg-white/10 text-gray-50" : ""
                    }`}
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-users"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Users
                    </span>
                    {pathname?.startsWith("/admin/users") && (
                      <span className="absolute left-0 top-0 h-full w-1 bg-indigo-600"></span>
                    )}
                  </Link>
                </li>
                <li className="relative">
                  <a
                    href="admin-projects.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-project-diagram"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Projects
                    </span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="admin-hubs.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-sitemap"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Domain Hubs
                    </span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="admin-events.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-calendar-alt"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Events
                    </span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="admin-rooms.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-video"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Collab Rooms
                    </span>
                  </a>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-xs uppercase text-gray-400 tracking-[0.05em] px-6 py-2 transition-opacity duration-300">
                Content
              </h3>
              <ul>
                <li className="relative">
                  <a
                    href="admin-content.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-file-alt"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Content Management
                    </span>
                  </a>
                </li>
                <li className="relative">
                  <Link
                    href="/admin/reports"
                    className={`flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10 ${
                      pathname?.startsWith("/admin/reports") ? "bg-white/10 text-gray-50" : ""
                    }`}
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-flag"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Reports
                    </span>
                  </Link>
                </li>
                <li className="relative">
                  <Link
                    href="/admin/posts"
                    className={`flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10 ${
                      pathname?.startsWith("/admin/posts") ? "bg-white/10 text-gray-50" : ""
                    }`}
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-file-alt"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Posts
                    </span>
                  </Link>
                </li>
                <li className="relative">
                  <Link
                    href="/admin/comments"
                    className={`flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10 ${
                      pathname?.startsWith("/admin/comments") ? "bg-white/10 text-gray-50" : ""
                    }`}
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-comments"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Comments
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-xs uppercase text-gray-400 tracking-[0.05em] px-6 py-2 transition-opacity duration-300">
                Settings
              </h3>
              <ul>
                <li className="relative">
                  <a
                    href="admin-settings.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-cog"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      System Settings
                    </span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="admin-integrations.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-plug"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Integrations
                    </span>
                  </a>
                </li>
                <li className="relative">
                  <a
                    href="admin-logs.html"
                    className="flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-300 hover:text-gray-50 hover:bg-white/10"
                  >
                    <span className="text-xl w-6 flex justify-center">
                      <i className="fas fa-history"></i>
                    </span>
                    <span className="transition-opacity duration-300 whitespace-nowrap">
                      Activity Logs
                    </span>
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="p-6 border-t border-white/10">
            <div className="bg-white/5 rounded-lg p-3 text-sm transition-opacity duration-300">
              <i className="fas fa-exclamation-triangle text-amber-500 mr-2"></i>
              <span>System update scheduled for 10/15</span>
            </div>
          </div>
        </aside>
        {/* Backdrop for mobile sidebar */}
        <div className="fixed inset-0 bg-black/50 z-[90] hidden"></div>

        {/* Main content */}
        <main className="flex-1 ml-[260px] transition-all duration-300 ease-in-out w-[calc(100%_-_260px)]">
          <header className="bg-white p-2 flex justify-between items-center border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <button className="hidden text-gray-500 text-xl">
                <i className="fas fa-bars"></i>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-[250px]">
                <button className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  <i className="fas fa-search"></i>
                </button>
                <input
                  type="text"
                  className="w-full px-2 py-2 pl-8 border border-gray-200 rounded-full font-['Inter'] text-sm bg-gray-100 transition-all duration-300 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                  placeholder="Search..."
                />
              </div>

              <button className="relative text-xl text-gray-500 p-2">
                <i className="fas fa-bell"></i>
                <span className="absolute top-0 right-0 w-[18px] h-[18px] bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              <SettingsTab
                icon="fas fa-sign-out-alt"
                text="Logout"
                isActive={false}
                onclick={() =>
                  showLogoutConfirmation("/admin/signIn")
                }
              />

              <div className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-300 hover:bg-gray-100">
                <img
                  src="https://ui-avatars.com/api/?name=Admin+User&background=4f46e5&color=fff"
                  alt="Admin User"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <span className="font-medium text-sm">Admin User</span>
                <i className="fas fa-chevron-down text-xs text-gray-500"></i>
              </div>
            </div>
          </header>
          {children}
        </main>

        
      </div>
    </>
  );
}
