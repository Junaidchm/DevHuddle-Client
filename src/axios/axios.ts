import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { getApiBaseUrl } from "@/src/constants/api.routes";

/**
 * Authenticated API client.
 *
 * withCredentials: true ensures httpOnly cookies (access_token, refresh_token)
 * are sent with every request. The API Gateway reads these cookies for auth.
 *
 * The Authorization header is NOT manually set here. The API Gateway reads
 * the httpOnly cookie directly — no need to manage the token in JS memory.
 *
 * Token refresh is handled transparently by NextAuth's JWT callback.
 * When the access token expires, NextAuth refreshes it automatically on the
 * next session read, updating both the NextAuth session and setting new cookies
 * via the backend.
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15_000,
  withCredentials: true, // Sends access_token + refresh_token cookies automatically
});

// ─────────────────────────────────────────────────────────────
// Refresh state management
// ─────────────────────────────────────────────────────────────

/** Queued requests waiting for the in-progress refresh to complete */
const pendingRefreshQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

let isRefreshing = false;
let isSigningOut = false;

function drainQueue(error: any, accessToken?: string) {
  pendingRefreshQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      // Retry with the refreshed cookies (cookies are updated server-side)
      axiosInstance(config).then(resolve).catch(reject);
    }
  });
  pendingRefreshQueue.length = 0;
}

// ─────────────────────────────────────────────────────────────
// Logout helper
// ─────────────────────────────────────────────────────────────

async function performLogout(redirectUrl: string = "/signIn") {
  if (isSigningOut) return;
  isSigningOut = true;

  try {
    // 1. Clear all server-side cookies (backend blacklist + Next.js cookies)
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Best-effort
  }

  try {
    // 2. Clear NextAuth client session
    await signOut({ redirect: false });
  } catch {
    // Best-effort
  }

  // 3. Clear any local state
  try {
    localStorage.clear();
  } catch {}

  // 4. Hard redirect (full page reload to clear all client state)
  window.location.href = redirectUrl;
}

// ─────────────────────────────────────────────────────────────
// Response Interceptor
// ─────────────────────────────────────────────────────────────

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Don't retry requests that already triggered a refresh
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Extract error message from the API Gateway response
    const responseData = error.response?.data;
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      (typeof responseData === "string" ? responseData : null) ||
      "";

    const errorMessageLower = String(errorMessage).toLowerCase();

    // ── Blocked user ──────────────────────────────────────────
    const isBlockedUser =
      errorMessageLower.includes("blocked") ||
      errorMessageLower.includes("you are blocked");

    if (isBlockedUser) {
      console.warn("[axios] Blocked user detected");
      if (!isSigningOut) {
        toast.error(
          errorMessage || "You are blocked from DevHuddle. Please contact support.",
          { duration: 5000, position: "top-center" }
        );
        // Determine correct sign-in page
        const isAdminRoute = window.location.pathname.startsWith("/admin");
        await performLogout(
          `/api/auth/logout?callbackUrl=${encodeURIComponent(
            isAdminRoute ? "/admin/signIn?error=blocked" : "/signIn?error=blocked"
          )}`
        );
      }
      return Promise.reject(error);
    }

    // ── Token refresh ─────────────────────────────────────────
    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRefreshQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      /**
       * How refresh works:
       * The browser has both access_token (expired) and refresh_token (valid) cookies.
       * We trigger NextAuth to re-evaluate the session — NextAuth's JWT callback will
       * detect the expired access token and call our backend /auth/refresh endpoint.
       * The backend sets NEW httpOnly cookies and returns new tokens.
       * NextAuth updates its session with the new tokens.
       * We then retry the original request — the browser now sends the new access_token cookie.
       */
      const sessionRes = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();

        // Check if NextAuth itself flagged the refresh as failed
        if (sessionData?.error === "RefreshTokenExpired") {
          throw new Error("RefreshTokenExpired");
        }

        if (sessionData?.user?.accessToken) {
          // Session refreshed successfully — drain the queue and retry
          console.log("[axios] Session refreshed, retrying original request");
          drainQueue(null);
          isRefreshing = false;
          return axiosInstance(originalRequest);
        }
      }

      throw new Error("Session refresh returned no valid token");
    } catch (refreshError) {
      console.error("[axios] Token refresh failed:", refreshError);
      drainQueue(refreshError);
      isRefreshing = false;

      if (!isSigningOut) {
        toast.error("Your session has expired. Please log in again.");
        const isAdminRoute = window.location.pathname.startsWith("/admin");
        await performLogout(isAdminRoute ? "/admin/signIn" : "/signIn");
      }

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;
