// src/utils/showLogoutConfirmation.tsx
"use client";

import toast from "react-hot-toast";

/**
 * Shows a confirmation toast for logout.
 * On confirm: calls POST /api/auth/logout to blacklist tokens + clear all cookies,
 * then does a hard redirect to ensure clean client state.
 *
 * @param redirectUrl - URL to redirect to after logout (default: "/signIn")
 */
export default function showLogoutConfirmation(redirectUrl: string = "/signIn") {
  toast(
    (t) => (
      <div className="flex flex-col items-start text-sm">
        <span className="font-medium mb-2">Are you sure you want to logout?</span>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                // 1. Call the centralized logout endpoint:
                //    - Blacklists tokens in Redis (backend)
                //    - Clears access_token + refresh_token cookies
                //    - Clears next-auth.session-token cookie
                await fetch("/api/auth/logout", { method: "POST" });

                // 2. Clear any local app state
                try { localStorage.clear(); } catch {}

                toast.success("Logged out successfully!", { duration: 2000 });

                // 3. Hard redirect (full page reload ensures clean React state)
                setTimeout(() => {
                  window.location.href = redirectUrl;
                }, 300);
              } catch (err) {
                console.error("Logout error:", err);
                // Even on error, redirect to sign-in as fallback
                window.location.href = redirectUrl;
              }
            }}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Yes, Logout
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
