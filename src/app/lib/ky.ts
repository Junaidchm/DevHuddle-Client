// lib/ky-wrapper.ts
// Centralized HTTP client wrapper using ky for Server Actions (industrial standard: reusable, with retries, auth hooks, timeouts)
import ky from 'ky';
import { auth } from '@/auth'; // NextAuth for session-based auth

// Global ky instance for server-side use (configurable for prod/dev)
const serverKy = ky.create({
  prefixUrl: process.env.API_GATEWAY,
  timeout: 10000, // 10s timeout
  retry: {
    limit: 2, // Max retries
    delay: (attemptCount: number) => Math.min(1000 * 2 ** (attemptCount - 1), 5000), // Exponential backoff (adjusted to start from attempt 1)
  },
  hooks: {
    beforeRequest: [
      async (request) => {
        const session = await auth();
        if (session?.user?.accessToken) {
          request.headers.set('Authorization', `Bearer ${session.user.accessToken}`);
        }
        request.headers.set('Content-Type', 'application/json');
        return request;
      },
    ],
  },
});

export default serverKy;