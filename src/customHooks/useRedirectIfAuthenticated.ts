"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import { useEffect } from "react";

export default function useRedirectIfAuthenticated(redirectTo: string = "/") {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.isAuthenticated);

  useEffect(() => {
    if (user) {
      router.push(redirectTo);
    }
  }, [router, user, redirectTo]);
}

export function useRedirectIfNotAuthenticated(redirectTo: string = "/signIn") {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.isAuthenticated);
  useEffect(() => {
    if (!user) {
      router.push(redirectTo);
    }
  }, [router, user, redirectTo]);
}
