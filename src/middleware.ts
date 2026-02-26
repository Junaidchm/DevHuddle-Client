/**
 * Next.js Middleware — Route Protection
 *
 * Uses ONLY the NextAuth session (req.auth) to determine authentication.
 * The session is managed by NextAuth and stored in the next-auth.session-token cookie.
 *
 * IMPORTANT: We do NOT check the access_token / refresh_token httpOnly cookies here.
 * Those are for the API Gateway only. Mixing both causes desync bugs.
 *
 * Auth states:
 * - req.auth?.user?.id  → authenticated
 * - req.auth === null   → not authenticated
 * - req.auth?.error === "RefreshTokenExpired" → refresh token expired → force re-login
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals and NextAuth API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────
  // Determine auth state
  // ─────────────────────────────────────────────
  const session = req.auth;
  const isAuthenticated = !!session?.user?.id;
  const hasRefreshError = session?.error === "RefreshTokenExpired";
  const userRole = session?.user?.role;

  // ─────────────────────────────────────────────
  // Refresh token expired — force re-login
  // Redirect to /signIn regardless of the page the user is on
  // (except if already on a public page to avoid loops)
  // ─────────────────────────────────────────────
  const publicRoutes = [
    "/signIn",
    "/signup",
    "/forgotPassword",
    "/verify-user",
    "/success",
    "/admin/signIn",
    "/reset-password",
    "/api/auth", // NextAuth internal routes (session, callback, etc.)
  ];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (hasRefreshError && !isPublicRoute) {
    const url = new URL("/signIn", req.url);
    url.searchParams.set("error", "session_expired");
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────
  // Admin routes
  // ─────────────────────────────────────────────
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminSignIn = pathname === "/admin/signIn";

  // Authenticated admin user on admin sign-in → redirect to dashboard
  if (isAdminSignIn && isAuthenticated && userRole === "superAdmin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Admin routes (not the sign-in page) require auth + superAdmin role
  if (isAdminRoute && !isAdminSignIn) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/signIn", req.url));
    }
    if (userRole !== "superAdmin") {
      const url = new URL("/", req.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ─────────────────────────────────────────────
  // Authenticated user on public/auth pages → redirect to home
  // (Exclude NextAuth internal API routes from this redirect)
  // ─────────────────────────────────────────────
  if (isPublicRoute && !isAdminSignIn && !pathname.startsWith("/api/auth") && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ─────────────────────────────────────────────
  // Unauthenticated user on protected routes → redirect to sign-in
  // ─────────────────────────────────────────────
  if (!isPublicRoute && !isAdminRoute && !isAuthenticated) {
    const url = new URL("/signIn", req.url);
    // Preserve the intended destination so we can redirect back after login
    if (pathname !== "/") {
      url.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (Next.js build assets)
     * - _next/image (image optimization)
     * - favicon.ico
     * - Public static files (anything with a file extension)
     *
     * NOTE: /api routes are NOT excluded here — they need the middleware to
     * pass-through. The NextAuth handler at /api/auth/* is handled by NextAuth.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
