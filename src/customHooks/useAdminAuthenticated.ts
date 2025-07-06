"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export default function useAdminRedirectIfAuthenticated(redirectTo: string = "/") {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (user.isAuthenticated && user.user?.role === 'superAdmin') {
      router.push(redirectTo);
    }
  }, [router, user, redirectTo]);
}

export  function useAdminRedirectIfNotAuthenticated(redirectTo:string) {
    const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user.isAuthenticated && user.user?.role !== 'superAdmin') {
      router.push(redirectTo);
    }
  }, [router, user, redirectTo]);
}
