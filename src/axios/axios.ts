import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { signOut, getSession } from "next-auth/react";

/**
 * ✅ FIXED: Client-side axios instance for authenticated API calls.
 * 
 * ❌ PROBLEM: Calling getSession() in interceptors caused:
 *    - 800+ session API calls per page load
 *    - Performance issues
 *    - Race conditions
 * 
 * ✅ SOLUTION: Components explicitly pass auth headers
 * 
 * Usage:
 * ```ts
 * import { useAuthHeaders } from "@/src/hooks/useAuthHeaders";
 * 
 * function MyComponent() {
 *   const authHeaders = useAuthHeaders();
 *   const response = await axiosInstance.get('/endpoint', {
 *     headers: authHeaders
 *   });
 * }
 * ```
 */
import { getApiBaseUrl } from "@/src/constants/api.routes";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10 * 1000,
  withCredentials: true,
});

// Flag to prevent multiple simultaneous redirects
let isRedirecting = false;
// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue of failed requests to retry after refresh
const failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

/**
 * ✅ Response interceptor for handling 401 errors globally
 * 
 * Handles two scenarios:
 * 1. Blocked users: Detects "blocked" in error message, signs out immediately, shows blocked message
 * 2. Session expired: Regular 401, redirects to sign-in
 * 
 * Note: Token refresh is handled by NextAuth's JWT callback.
 * This interceptor only handles redirects for expired sessions and blocked users.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      const isReportEndpoint = url.includes("/report");
      
      // For report endpoints, show error but don't redirect
      if (isReportEndpoint) {
        return Promise.reject(error);
      }
      
      // Extract error message from response
      // API Gateway sends: { status: number, message: string, success: false }
      // Some endpoints might send: { error: string } or { message: string }
      const responseData = error.response?.data;
      const errorMessage = responseData?.message || 
                          responseData?.error || 
                          (typeof responseData === 'string' ? responseData : null) ||
                          error.message || 
                          "";
      
      // Debug logging for blocked user detection
      if (error.response?.status === 401) {
        console.log("[Axios Interceptor] 401 Error Details:", {
          url: error.config?.url,
          status: error.response.status,
          responseData,
          extractedMessage: errorMessage,
        });
      }
      
      // Check if user is blocked (case-insensitive check for "blocked" keyword)
      // Also check for common blocked user message patterns
      const errorMessageLower = errorMessage.toLowerCase();
      const isBlockedUser = errorMessageLower.includes("blocked") || 
                           errorMessageLower.includes("you are blocked") ||
                           errorMessageLower.includes("your are blocked");
      
      if (isBlockedUser) {
        console.log("[Axios Interceptor] Blocked user detected:", errorMessage);
      }
      
      // Prevent multiple simultaneous redirects
      if (isRedirecting) {
        return Promise.reject(error);
      }
      
      // Check if we're on an admin route to redirect to correct sign-in page
      const isAdminRoute = window.location.pathname.startsWith("/admin");
      const redirectUrl = isAdminRoute ? "/admin/signIn" : "/signIn";
      
      // Set redirect flag to prevent multiple redirects
      isRedirecting = true;
      
      if (isBlockedUser) {
        // User is blocked - show blocked message and sign out immediately
        toast.error(errorMessage || "You are blocked from DevHuddle, Please contact support", {
          duration: 5000,
          position: "top-center",
        });
        
        // Clear any cached data
        localStorage.clear();
        
        // Sign out from NextAuth immediately
        try {
          await signOut({ redirect: false });
        } catch (signOutError) {
          console.error("Error signing out:", signOutError);
        }
        
        // Redirect to sign-in page with blocked user message
        setTimeout(() => {
          window.location.href = `${redirectUrl}?error=blocked&message=${encodeURIComponent(errorMessage || "You are blocked from DevHuddle, Please contact support")}`;
          // Reset redirect flag after redirect completes
          setTimeout(() => {
            isRedirecting = false;
          }, 2000);
        }, 100);
      } else {
        // Regular session expiration - try to refresh token first
        // ✅ FIXED: Attempt NextAuth token refresh before redirecting
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            console.log("[Axios Interceptor] Attempting to refresh session...");
            
            // Call getSession() which triggers NextAuth's JWT callback
            // The JWT callback will attempt to refresh the token
            const session = await getSession();
            
            if (session?.user?.accessToken) {
              console.log("[Axios Interceptor] Session refreshed successfully");
              
              // Update the original request with new token
              const originalRequest = error.config;
              if (originalRequest) {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${session.user.accessToken}`;
                
                // Process queued requests
                failedQueue.forEach(({ resolve, reject, config }) => {
                  config.headers = config.headers || {};
                  config.headers.Authorization = `Bearer ${session.user.accessToken}`;
                  axiosInstance(config)
                    .then(resolve)
                    .catch(reject);
                });
                failedQueue.length = 0; // Clear queue
                
                // Session refreshed - retry the original request
                isRefreshing = false;
                
                // Retry the request
                return axiosInstance(originalRequest);
              }
            } else {
              // Refresh failed - no valid session
              throw new Error("Session refresh failed");
            }
          } catch (refreshError) {
            console.error("[Axios Interceptor] Session refresh failed:", refreshError);
            isRefreshing = false;
            
            // Reject all queued requests
            failedQueue.forEach(({ reject }) => {
              reject(refreshError);
            });
            failedQueue.length = 0; // Clear queue
            
            // Refresh failed - sign out and redirect
            toast.error("Session expired. Please log in again.");
            
            // Clear any cached data
            localStorage.clear();
            
            // Sign out from NextAuth
            try {
              await signOut({ redirect: false });
            } catch (signOutError) {
              console.error("Error signing out:", signOutError);
            }
            
            // Redirect to appropriate sign-in page
            if (!isRedirecting) {
              isRedirecting = true;
              setTimeout(() => {
                window.location.href = redirectUrl;
                // Reset redirect flag after redirect completes
                setTimeout(() => {
                  isRedirecting = false;
                }, 2000);
              }, 100);
            }
          }
        } else {
          // Already refreshing - wait for it to complete
          // Queue this request to retry after refresh
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve,
              reject,
              config: error.config!,
            });
          });
        }
      }
    }

    return Promise.reject(error);
  }
);
