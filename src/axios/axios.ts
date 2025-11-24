import axios, { AxiosInstance } from "axios";
import toast from "react-hot-toast";

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

/**
 * ✅ Response interceptor for handling 401 errors globally
 * 
 * Note: Token refresh is handled by NextAuth's JWT callback.
 * This interceptor only handles redirects for expired sessions.
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // NextAuth automatically refreshes tokens via JWT callback
      // If we get here, refresh failed or session is invalid
      toast.error("Session expired. Please log in again.");
      
      // Clear any cached data
      localStorage.clear();
      
      // Redirect to sign in
      window.location.href = "/signIn";
    }

    return Promise.reject(error);
  }
);
