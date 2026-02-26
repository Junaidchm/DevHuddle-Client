"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * OAuth Callback Sync Page
 *
 * After Google OAuth, the auth-service redirects the browser here.
 * At this point:
 *   - access_token and refresh_token httpOnly cookies are already set by the API Gateway
 *   - NextAuth has no session yet (it doesn't know about the OAuth login)
 *
 * This page bridges the gap: it calls signIn('google-sync') which runs the
 * google-sync provider's authorize() function server-side. That function reads
 * the httpOnly cookies, calls /auth/me to verify the user, and creates a
 * NextAuth session with the tokens.
 *
 * After that, the user is fully authenticated on both layers.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const hasSynced = useRef(false);

  useEffect(() => {
    // Prevent double-execution in React 18 Strict Mode
    if (hasSynced.current) return;
    hasSynced.current = true;

    const syncSession = async () => {
      try {
        const result = await signIn("google-sync", {
          redirect: false,
        });

        if (!result || result.error) {
          console.error("[success] Google sync failed:", result?.error);
          router.push(`/signIn?error=oauth_sync_failed`);
          return;
        }

        // Sync successful — use hard navigation to ensure fresh page state
        // (avoids Next.js router cache serving a stale unauthenticated layout)
        window.location.href = redirectTo;
      } catch (err) {
        console.error("[success] Unexpected error during OAuth sync:", err);
        router.push("/signIn?error=oauth_failed");
      }
    };

    syncSession();
  }, [router, redirectTo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Completing sign-in...</p>
      </div>
    </div>
  );
}