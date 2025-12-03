"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

/**
 * Hook to redirect admin users if they are already authenticated
 * Used on admin sign-in page to redirect to dashboard if already logged in
 */
export default function useAdminRedirectIfAuthenticated(redirectTo: string = "/") {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Only redirect once and only when session is loaded
    if (status === "loading" || hasRedirected) return;

    if (status === "authenticated" && session?.user?.role === 'superAdmin') {
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [router, session, status, redirectTo, hasRedirected]);
}

/**
 * Hook to redirect non-admin users away from admin pages
 * Used in admin layout to protect admin routes
 */
export function useAdminRedirectIfNotAuthenticated(redirectTo: string) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for session to load
    if (status === "loading") {
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    // Only redirect once
    if (hasRedirected) return;

    if (status === "unauthenticated" || session?.user?.role !== 'superAdmin') {
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [router, session, status, redirectTo, hasRedirected]);

  return { isChecking, isAuthenticated: status === "authenticated" && session?.user?.role === 'superAdmin' };
}
