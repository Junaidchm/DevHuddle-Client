
"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import FullScreenLoader from "../components/FullScreenLoader";
import toast from "react-hot-toast";

/**
 * SessionProviderWrapper
 *
 * Responsibilities:
 * - Shows loading state for protected routes while session is loading
 * - Allows public routes to render immediately
 * - ✅ BLOCKED USER: Watches for `session.error === 'UserBlocked'`
 *   and immediately signs the user out with a toast notification.
 *   This is the CLIENT-SIDE enforcement layer — it runs on active pages
 *   without needing a page navigation to trigger the server-side middleware.
 */
export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // ✅ BLOCKED USER ENFORCEMENT (Client-side layer)
  // The server-side middleware handles page navigations.
  // This handles the case where the user is ALREADY on a page when the block happens.
  useEffect(() => {
    if ((session as any)?.error === "UserBlocked") {
      toast.error(
        "Your account has been blocked by the admin. You are being signed out.",
        { duration: 6000, position: "top-center" }
      );

      // Wipe all cookies and sign out
      fetch("/api/auth/logout", { method: "POST" }).finally(() => {
        signOut({ redirect: false }).finally(() => {
          router.replace("/signIn?error=user_blocked");
        });
      });
    }
  }, [session, router]);

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
  if (status === "loading" && !isPublicRoute && !isAdminRoute) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}