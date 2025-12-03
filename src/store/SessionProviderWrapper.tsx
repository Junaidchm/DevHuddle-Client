"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { AppDispatch, RootState } from "./store";
import { getUser } from "./actions/authActions";
import { logoutUserAction } from "./slices/userSlice";
import FullScreenLoader from "../components/FullScreenLoader";

/**
 * This component is responsible for synchronizing the NextAuth session with the Redux store.
 * - When a user session exists, it fetches the user data and stores it in Redux.
 * - When the user logs out, it clears the user data from Redux.
 * 
 * ✅ FIXED: Don't block public/auth routes while session is loading
 * - Public routes (signIn, signup, etc.) can render immediately
 * - Only protected routes wait for session status
 */
export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const pathname = usePathname();

  // Public routes that don't need session check
  const publicRoutes = ["/signIn", "/signup", "/forgotPassword", "/verify-user", "/success", "/admin/signIn"];
  const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));
  
  // Admin routes - handle differently (don't sync with Redux user state)
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    // For admin routes, don't sync with Redux user state
    // Admin authentication is handled entirely through NextAuth session
    if (isAdminRoute) {
      return;
    }

    // When session is authenticated and not yet in Redux, fetch user data
    // Only for non-admin routes
    if (status === "authenticated" && !isAuthenticated && !isAdminRoute) {
      dispatch(getUser());
    }

    // When session is unauthenticated but Redux still has a user, log them out
    // Only for non-admin routes
    if (status === "unauthenticated" && isAuthenticated && !isAdminRoute) {
      dispatch(logoutUserAction());
    }
  }, [status, isAuthenticated, dispatch, isAdminRoute]);

  // Allow public routes and admin routes to render immediately, even while session is loading
  // Admin routes handle their own loading states
  if (status === "loading" && !isPublicRoute && !isAdminRoute) {
    return <FullScreenLoader />;
  }

  return <>{children}</>;
}