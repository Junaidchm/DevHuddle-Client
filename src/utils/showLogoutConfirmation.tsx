// src/utils/showLogoutConfirmation.tsx
"use client";

import toast from "react-hot-toast";
import { AppDispatch } from "@/src/store/store";
import {  logoutUser } from "@/src/services/api/auth.service"; // your API call
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUserAction } from "../store/slices/userSlice";
import { QueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

export default function showLogoutConfirmation(dispatch: AppDispatch, router: ReturnType<typeof useRouter>,url:string) {

  const queryClient = new QueryClient()

  toast(
    (t) => (
      <div className="flex flex-col items-start text-sm">
        <span className="font-medium mb-2">Are you sure you want to logout?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                // queryClient.clear()
                // // await logoutUser();
                // // dispatch(logoutUserAction());
                // signOut()
                // localStorage.clear()
                // toast.success("Logged out successfully!");
                // router.push(url);
                // ✅ logout from NextAuth (cookies cleared)
                await signOut({ redirect: false });

                // ✅ if you keep custom user data in Redux/localStorage
                // dispatch(logoutUserAction());
                localStorage.clear();

                toast.success("Logged out successfully!");

                // ✅ navigate manually
                router.push(url);
              } catch (err) {
                toast.error("Logout failed");
              }
            }}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 px-3 py-1 rounded text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    { duration: 10000 }
  );
}
