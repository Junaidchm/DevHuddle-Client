"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect } from "react";

export const useProtected = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);
};
