/**
 * ✅ FIXED: Proper client-side auth headers hook
 * 
 * ❌ PROBLEM: getSession() in utility functions causes:
 *    - Excessive session API calls (hundreds per page load)
 *    - Race conditions
 *    - Performance issues
 * 
 * ✅ SOLUTION: Use React hooks properly in client components
 * 
 * This hook should be used in client components to get auth headers:
 * 
 * @example
 * ```ts
 * "use client";
 * function MyComponent() {
 *   const authHeaders = useAuthHeaders();
 *   
 *   const fetchData = async () => {
 *     const res = await axiosInstance.get('/api/endpoint', { headers: authHeaders });
 *   };
 * }
 * ```
 */
"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useAuthHeaders(): Record<string, string> {
  const { data: session } = useSession();
  
  return useMemo(() => {
    if (!session?.user?.accessToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${session.user.accessToken}`,
    };
  }, [session?.user?.accessToken]);
}
