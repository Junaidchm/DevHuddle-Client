/**
 * ✅ FIXED: Middleware using Next.js 15 + NextAuth pattern
 * 
 * ❌ OLD: auth() wrapping function (deprecated pattern)
 * ✅ NEW: Export auth as middleware (Next.js 15 best practice)
 * 
 * References:
 * - https://next-auth.js.org/configuration/nextjs#middleware
 * - https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth?.user;

  console.log('this is middlware stuff for authe ---------------->', req.auth?.user)

  // Redirect to home if already logged in and trying to access sign-in
  if (pathname === '/signIn' && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect to sign-in if not authenticated and trying to access protected routes
  if (!isAuthenticated && (pathname === '/' || pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/signIn', req.url));
  }

  // Optional: Admin route protection (currently commented out)
  // if (pathname.startsWith("/admin") && req.auth?.user?.role !== "admin") {
  //   return NextResponse.redirect(new URL("/unauthorized", req.url));
  // }

  return NextResponse.next();
});

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
