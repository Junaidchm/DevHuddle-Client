/**
 * POST /api/auth/logout
 *
 * Centralized logout handler that:
 * 1. Calls the backend /auth/logout to blacklist the JWT JTI in Redis
 * 2. Clears the httpOnly auth cookies (access_token, refresh_token)
 * 3. Signs out of NextAuth (clears next-auth.session-token)
 * 4. Returns a redirect URL to the caller
 *
 * IMPORTANT: This MUST be a POST request (not GET) to prevent CSRF.
 * To trigger: fetch('/api/auth/logout', { method: 'POST' }) then window.location.href = signInUrl
 */
import { auth, signOut } from "@/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    const refreshToken = cookieStore.get("refresh_token")?.value;

    // 1. Call the backend logout endpoint to blacklist the JTI in Redis
    //    (Fire-and-forget — don't block logout on backend failure)
    if (accessToken || refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Forward the cookies so the backend can extract JTIs
            Cookie: [
              accessToken ? `access_token=${accessToken}` : "",
              refreshToken ? `refresh_token=${refreshToken}` : "",
            ]
              .filter(Boolean)
              .join("; "),
          },
          cache: "no-store",
          signal: AbortSignal.timeout(5_000),
        });
      } catch (backendErr) {
        // Backend logout is best-effort — don't block client-side logout
        console.warn("[logout] Backend logout call failed:", backendErr);
      }
    }

    // 2. Clear httpOnly auth cookies on the Next.js server
    const cookiesToDelete = ["access_token", "refresh_token"];
    const response = NextResponse.json({ success: true });

    cookiesToDelete.forEach((name) => {
      response.cookies.delete(name);
    });

    // 3. Sign out of NextAuth (clears next-auth.session-token)
    //    We can't call signOut() from a Route Handler directly,
    //    so we clear the NextAuth session cookie manually.
    //    NextAuth session cookie names vary by version:
    const nextAuthCookieNames = [
      "next-auth.session-token",
      "__Secure-next-auth.session-token",
      "authjs.session-token",
      "__Secure-authjs.session-token",
    ];

    nextAuthCookieNames.forEach((name) => {
      response.cookies.delete(name);
    });

    return response;
  } catch (error) {
    console.error("[logout] Logout handler error:", error);
    // Even if something fails, return success so the client can redirect
    return NextResponse.json({ success: true });
  }
}

/**
 * GET /api/auth/logout?callbackUrl=/signIn
 *
 * Support legacy GET-based logout redirects for backwards compatibility.
 * Immediately POSTs to itself and redirects.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get("callbackUrl") || "/signIn";

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Best-effort backend blacklist
  if (accessToken || refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: [
            accessToken ? `access_token=${accessToken}` : "",
            refreshToken ? `refresh_token=${refreshToken}` : "",
          ]
            .filter(Boolean)
            .join("; "),
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      // Best-effort
    }
  }

  // Build redirect response and clear all auth cookies
  const response = NextResponse.redirect(new URL(callbackUrl, request.url));
  const allAuthCookies = [
    "access_token",
    "refresh_token",
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
  ];

  allAuthCookies.forEach((name) => {
    response.cookies.delete(name);
  });

  return response;
}