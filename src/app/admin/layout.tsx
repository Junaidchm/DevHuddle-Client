"use client";
import showLogoutConfirmation from "@/src/utils/showLogoutConfirmation";
import "../styles/admin.css";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/store";
import { usePathname, useRouter } from "next/navigation";
import { useAdminRedirectIfNotAuthenticated } from "@/src/customHooks/useAdminAuthenticated";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { SettingsTab } from "@/src/components/shared/SettingsTab";
import { useState } from "react";
import { useSession } from "next-auth/react";

// ─── Nav Items ────────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", icon: "fas fa-chart-line", label: "Dashboard" },
    ],
  },
  {
    label: "User Management",
    items: [
      { href: "/admin/users", icon: "fas fa-users", label: "Users" },
    ],
  },
  {
    label: "Content Moderation",
    items: [
      { href: "/admin/posts", icon: "fas fa-file-alt", label: "Posts" },
      { href: "/admin/projects", icon: "fas fa-project-diagram", label: "Projects" },
      { href: "/admin/comments", icon: "fas fa-comments", label: "Comments" },
      { href: "/admin/hubs", icon: "fas fa-layer-group", label: "Hubs" },
    ],
  },
  {
    label: "Reports",
    items: [
      { href: "/admin/reports", icon: "fas fa-flag", label: "Reports" },
    ],
  },
  {
    label: "Audit",
    items: [
      { href: "/admin/audit-logs", icon: "fas fa-history", label: "Audit Logs" },
    ],
  },
];

// ─── Sidebar Item ──────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon,
  label,
  pathname,
  onClick,
}: {
  href: string;
  icon: string;
  label: string;
  pathname: string | null;
  onClick?: () => void;
}) {
  const isActive =
    href === "/admin/dashboard"
      ? pathname === "/admin/dashboard"
      : pathname?.startsWith(href) ?? false;

  return (
    <li className="relative">
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-3 px-6 py-3 text-gray-400 transition-all duration-200 hover:text-gray-50 hover:bg-white/10 ${
          isActive ? "bg-white/10 text-gray-50" : ""
        }`}
      >
        <span className="text-lg w-5 flex justify-center">
          <i className={icon}></i>
        </span>
        <span className="text-sm whitespace-nowrap">{label}</span>
        {isActive && (
          <span className="absolute left-0 top-0 h-full w-[3px] bg-indigo-500 rounded-r"></span>
        )}
      </Link>
    </li>
  );
}

// ─── Sidebar Content ───────────────────────────────────────────────────────────

function SidebarNav({
  pathname,
  onItemClick,
}: {
  pathname: string | null;
  onItemClick?: () => void;
}) {
  return (
    <nav className="flex-1 py-4 overflow-y-auto">
      {NAV_SECTIONS.map((section) => (
        <div key={section.label} className="mb-2">
          <h3 className="text-[10px] uppercase text-gray-500 tracking-widest px-6 py-2 font-semibold">
            {section.label}
          </h3>
          <ul>
            {section.items.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                pathname={pathname}
                onClick={onItemClick}
              />
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// ─── Layout ────────────────────────────────────────────────────────────────────

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data: session } = useSession();

  const adminName = session?.user?.name || "Admin";
  const adminInitials = adminName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
        {/* ── Desktop Sidebar ── */}
        <aside className="w-[240px] bg-gray-900 text-gray-50 h-screen fixed z-50 flex flex-col max-lg:hidden">
          {/* Brand */}
          <div className="p-5 flex items-center gap-3 border-b border-white/10 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-code text-white text-sm"></i>
            </div>
            <span className="font-bold text-base">DevHuddle</span>
            <span className="ml-auto text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
              Admin
            </span>
          </div>

          {/* Navigation */}
          <SidebarNav pathname={pathname} />
        </aside>

        {/* ── Mobile Sidebar ── */}
        <aside
          className={`w-[240px] bg-gray-900 text-gray-50 h-screen fixed z-50 flex flex-col lg:hidden transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-5 flex items-center gap-3 border-b border-white/10">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-code text-white text-sm"></i>
            </div>
            <span className="font-bold text-base">DevHuddle</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="ml-auto text-gray-400 hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <SidebarNav
            pathname={pathname}
            onItemClick={() => setIsSidebarOpen(false)}
          />
        </aside>

        {/* Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* ── Main Content ── */}
        <main className="flex-1 lg:ml-[240px] w-full lg:w-[calc(100%_-_240px)] min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white px-4 sm:px-6 py-3.5 flex justify-between items-center border-b border-gray-200 shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-500 text-xl p-1.5"
                aria-label="Open sidebar"
              >
                <i className="fas fa-bars"></i>
              </button>
              <h1 className="text-sm font-semibold text-gray-400 hidden sm:block">
                Admin Console
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Logout */}
              <div className="hidden sm:block">
                <SettingsTab
                  icon="fas fa-sign-out-alt"
                  text="Logout"
                  isActive={false}
                  onclick={() => showLogoutConfirmation("/admin/signIn")}
                />
              </div>

              {/* Admin avatar */}
              <div className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {adminInitials}
                </div>
                <span className="font-medium text-sm hidden md:inline text-gray-700">
                  {adminName}
                </span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </>
  );
}
