"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import FullScreenLoader from "../components/FullScreenLoader";

/**
 * ✅ MIGRATED TO NEXTAUTH
 * 
 * Simplified SessionProviderWrapper - no longer syncs with Redux
 * 
 * Responsibilities:
 * - Shows loading state for protected routes while session is loading
 * - Allows public routes to render immediately
 * 
 * All authentication state is now managed by NextAuth directly.
 * Components use useSession() hook instead of Redux user state.
 */
export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const pathname = usePathname();

  // Public routes that don't need session check
  const publicRoutes = [
    "/signIn",
    "/signup",
    "/forgotPassword",
    "/verify-user",
    "/success",
    "/admin/signIn",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  // Admin routes handle their own loading states
  const isAdminRoute = pathname?.startsWith("/admin");

  // Show loading only for protected routes (not public, not admin)
  // Public routes and admin routes can render immediately
  if (status === "loading" && !isPublicRoute && !isAdminRoute) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}