

"use client";
import { useSession } from "next-auth/react";
import React, { useMemo } from "react";

export default function useGetUserData() {
  const { data: session, status } = useSession();
  
  // Don't throw error while loading
  if (status === "loading") {
    return null; // or return loading state
  }
  
  // Only throw error if explicitly unauthenticated
  if (status === "unauthenticated" || !session?.user) {
    throw new Error("There is no user found");
  }

  return useMemo(()=> {
    return session.user;
  }, [session.user]);
}
