"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store";
import { getUser } from "./actions/authActions";
import { logoutUserAction } from "./slices/userSlice";

/**
 * This component is responsible for synchronizing the NextAuth session with the Redux store.
 * - When a user session exists, it fetches the user data and stores it in Redux.
 * - When the user logs out, it clears the user data from Redux.
 */
export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    // When session is authenticated and not yet in Redux, fetch user data
    if (status === "authenticated" && !isAuthenticated) {
      dispatch(getUser());
    }

    // When session is unauthenticated but Redux still has a user, log them out
    if (status === "unauthenticated" && isAuthenticated) {
      dispatch(logoutUserAction());
    }
  }, [status, isAuthenticated, dispatch]);

  return <>{children}</>;
}