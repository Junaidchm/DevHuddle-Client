// src/utils/showLogoutConfirmation.tsx
"use client";

import toast from "react-hot-toast";
import { signOut } from "next-auth/react";

/**
 * ✅ FIXED: Logout confirmation
 * 
 * Simplified to only use NextAuth signOut - no Redux or QueryClient needed
 * 
 * @param redirectUrl - URL to redirect to after logout (default: "/admin/signIn")
 */
export default function showLogoutConfirmation(redirectUrl: string = "/admin/signIn") {

  toast(
    (t) => (
      <div className="flex flex-col items-start text-sm">
        <span className="font-medium mb-2">Are you sure you want to logout?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                // ✅ FIXED: Logout flow using NextAuth
                // signOut will clear cookies and session
                // Use window.location for hard reload to ensure clean state
                
                await signOut({ redirect: false });

                // Clear localStorage
                localStorage.clear();

                toast.success("Logged out successfully!");

                // ✅ Use window.location for hard reload to ensure clean state
                // Small delay to show toast
                setTimeout(() => {
                  window.location.href = redirectUrl;
                }, 300);
              } catch (err) {
                console.error("Logout error:", err);
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
