"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

/**
 * ✅ MIGRATED TO NEXTAUTH
 * Redirects authenticated users away from auth pages (sign-in, sign-up, etc.)
 * 
 * @param redirectTo - Where to redirect if user is authenticated (default: "/")
 */
export default function useRedirectIfAuthenticated(redirectTo: string = "/") {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't redirect while loading or if already redirected
    if (status === "loading" || hasRedirected) return;
    
    // If user is authenticated, redirect them
    if (status === "authenticated" && session?.user) {
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [router, status, session, redirectTo, hasRedirected]);
}

/**
 * ✅ MIGRATED TO NEXTAUTH
 * Redirects unauthenticated users to sign-in page
 * 
 * @param redirectTo - Where to redirect if user is not authenticated (default: "/signIn")
 */
export function useRedirectIfNotAuthenticated(redirectTo: string = "/signIn") {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't redirect while loading or if already redirected
    if (status === "loading" || hasRedirected) return;
    
    // If user is not authenticated, redirect to sign-in
    if (status === "unauthenticated" || !session?.user) {
      setHasRedirected(true);
      router.push(redirectTo);
    }
  }, [router, status, session, redirectTo, hasRedirected]);
}
