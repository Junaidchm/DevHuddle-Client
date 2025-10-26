/**
 * ✅ FIXED: Client-side auth headers helper
 * 
 * ❌ PROBLEM: Cannot use getSession() in arbitrary utility functions
 *    - Causes excessive session API calls
 *    - No access to React context
 *    - Creates race conditions
 * 
 * ✅ SOLUTION: Use useSession hook in components, pass headers explicitly
 * 
 * Instead of calling this in utilities, use:
 * ```ts
 * const { data: session } = useSession();
 * if (session?.user?.accessToken) {
 *   const headers = { Authorization: `Bearer ${session.user.accessToken}` };
 *   await axiosInstance.get('/endpoint', { headers });
 * }
 * ```
 */
import { headers } from "next/headers";

export async function authHeaders() {
  return headers();
}