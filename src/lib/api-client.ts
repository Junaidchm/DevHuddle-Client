/**
 * ✅ PRODUCTION-READY: Centralized API Client
 * 
 * This client automatically injects Authorization headers from NextAuth session.
 * Components should NOT pass auth headers manually - this client handles it.
 * 
 * Benefits:
 * - Single source of truth for auth headers
 * - Automatic token injection
 * - Consistent error handling
 * - No tokens in React Query keys
 */

import { axiosInstance } from "@/src/axios/axios";
import { getSession } from "next-auth/react";

export interface ApiClientOptions {
  requireAuth?: boolean;
  timeout?: number;
}

/**
 * Get auth headers from NextAuth session
 * This is the ONLY place where we read the token
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await getSession();
    if (!session?.user?.accessToken) {
      return {};
    }
    return {
      Authorization: `Bearer ${session.user.accessToken}`,
    };
  } catch (error) {
    console.error("[ApiClient] Failed to get session:", error);
    return {};
  }
}

/**
 * Centralized API client that automatically injects auth headers
 * 
 * Usage:
 * ```ts
 * const apiClient = createApiClient();
 * const data = await apiClient.get('/api/users');
 * ```
 */
export function createApiClient(options: ApiClientOptions = {}) {
  const { requireAuth = false } = options;

  return {
    async get<T = any>(url: string, config?: any): Promise<T> {
      const headers = await getAuthHeaders();
      
      if (requireAuth && !headers.Authorization) {
        throw new Error("Authentication required");
      }

      const response = await axiosInstance.get(url, {
        ...config,
        headers: {
          ...config?.headers,
          ...headers,
        },
      });
      return response.data;
    },

    async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
      const headers = await getAuthHeaders();
      
      if (requireAuth && !headers.Authorization) {
        throw new Error("Authentication required");
      }

      const response = await axiosInstance.post(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          ...headers,
        },
      });
      return response.data;
    },

    async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
      const headers = await getAuthHeaders();
      
      if (requireAuth && !headers.Authorization) {
        throw new Error("Authentication required");
      }

      const response = await axiosInstance.patch(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          ...headers,
        },
      });
      return response.data;
    },

    async delete<T = any>(url: string, config?: any): Promise<T> {
      const headers = await getAuthHeaders();
      
      if (requireAuth && !headers.Authorization) {
        throw new Error("Authentication required");
      }

      const response = await axiosInstance.delete(url, {
        ...config,
        headers: {
          ...config?.headers,
          ...headers,
        },
      });
      return response.data;
    },
  };
}

/**
 * Hook-based API client for React components
 * Uses useSession for reactive updates
 */
import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function useApiClient(options: ApiClientOptions = {}) {
  const { data: session, status } = useSession();
  const { requireAuth = false } = options;

  const apiClient = useMemo(() => {
    const getHeaders = () => {
      if (!session?.user?.accessToken) {
        if (requireAuth) {
          throw new Error("Authentication required");
        }
        return {};
      }
      return {
        Authorization: `Bearer ${session.user.accessToken}`,
      };
    };

    return {
      getHeaders,
      isReady: status !== "loading" && (requireAuth ? !!session?.user?.accessToken : true),
      get: async <T = any>(url: string, config?: any): Promise<T> => {
        const headers = getHeaders();
        const response = await axiosInstance.get(url, {
          ...config,
          headers: { ...config?.headers, ...headers },
        });
        return response.data;
      },
      post: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        const headers = getHeaders();
        const response = await axiosInstance.post(url, data, {
          ...config,
          headers: { ...config?.headers, ...headers },
        });
        return response.data;
      },
      patch: async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
        const headers = getHeaders();
        const response = await axiosInstance.patch(url, data, {
          ...config,
          headers: { ...config?.headers, ...headers },
        });
        return response.data;
      },
      delete: async <T = any>(url: string, config?: any): Promise<T> => {
        const headers = getHeaders();
        const response = await axiosInstance.delete(url, {
          ...config,
          headers: { ...config?.headers, ...headers },
        });
        return response.data;
      },
    };
  }, [session, status, requireAuth]);

  return apiClient;
}

