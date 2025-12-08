"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

/**
 * ✅ MIGRATED TO NEXTAUTH
 * Protects a route by redirecting unauthenticated users to home page
 */
export const useProtected = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Don't redirect while loading or if already redirected
    if (status === "loading" || hasRedirected) return;
    
    // If user is not authenticated, redirect to home
    if (status === "unauthenticated" || !session?.user) {
      setHasRedirected(true);
      router.push("/");
    }
  }, [router, status, session, hasRedirected]);
};
