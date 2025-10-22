// // lib/ky-wrapper.ts
// // Centralized HTTP client wrapper using ky for Server Actions (industrial standard: reusable, with retries, auth hooks, timeouts)
// import ky from 'ky';
// import { auth } from '@/auth'; // NextAuth for session-based auth

import ky from "ky";
import { auth } from "@/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.LOCAL_APIGATEWAY_URL;

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL environment variable is required');
}

// Create ky instance with enhanced retry policy and server-side auth
export const api = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 10000,
  retry: {
    limit: 3,
    methods: ['get', 'post', 'put', 'delete'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
    delay: (attemptCount: number) => Math.min(1000 * 2 ** (attemptCount - 1), 4000),
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        // Add auth header to requests using server-side auth
        const session = await auth();
        if (session?.user?.accessToken) {
          request.headers.set('Authorization', `Bearer ${session.user.accessToken}`);
        }
        request.headers.set('Content-Type', 'application/json');
      },
    ],
    beforeRetry: [
      async ({ request, options, error, retryCount }) => {
        console.log(`Retrying request (attempt ${retryCount + 1}): ${request.url}`);
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle 401 responses globally
        if (response.status === 401) {
          throw new Error('UNAUTHORIZED');
        }
        return response;
      },
    ],
  },
});