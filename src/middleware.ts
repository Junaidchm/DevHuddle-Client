/**
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
  const userRole = req.auth?.user?.role;

  // Public routes that don't need authentication
  const publicRoutes = ['/signIn', '/signup', '/forgotPassword', '/verify-user', '/success', '/admin/signIn'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Admin routes - require superAdmin role
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminSignIn = pathname === '/admin/signIn';

  // Protect admin routes (except admin sign-in page)
  if (isAdminRoute && !isAdminSignIn) {
    if (!isAuthenticated) {
      // Not authenticated, redirect to admin sign-in
      return NextResponse.redirect(new URL('/admin/signIn', req.url));
    }
    if (userRole !== 'superAdmin') {
      // Authenticated but not superAdmin, redirect to home with error
      const url = new URL('/', req.url);
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
  }

  // Redirect to admin dashboard if already logged in as superAdmin and trying to access admin sign-in
  if (isAdminSignIn && isAuthenticated && userRole === 'superAdmin') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  // Redirect to home if already logged in and trying to access regular auth pages
  if (isPublicRoute && !isAdminSignIn && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect to sign-in if not authenticated and trying to access protected routes
  if (!isPublicRoute && !isAdminRoute && !isAuthenticated && (pathname === '/' || pathname.startsWith('/profile'))) {
    return NextResponse.redirect(new URL('/signIn', req.url));
  }

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
