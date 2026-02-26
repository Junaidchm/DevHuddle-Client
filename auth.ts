import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API_ROUTES, getApiBaseUrl } from "./src/constants/api.routes";

/**
 * ARCHITECTURE:
 *
 * Tokens live in TWO places simultaneously:
 *   1. httpOnly cookies (access_token, refresh_token) — set by API Gateway/Auth Service
 *      → Used by the API Gateway to authenticate backend API calls
 *   2. NextAuth JWT session (next-auth.session-token) — encrypted cookie managed by NextAuth
 *      → Used by Next.js middleware to protect pages
 *
 * On login (credentials or Google OAuth):
 *   - The backend sets httpOnly cookies AND returns tokens in the JSON response
 *   - NextAuth stores the tokens in its own encrypted session (next-auth.session-token)
 *   - Both stay in sync because the JWT callback refreshes proactively
 *
 * Token refresh:
 *   - NextAuth JWT callback checks if the access token will expire in <1 minute
 *   - If so, calls the backend /auth/refresh endpoint
 *   - Backend rotates both tokens (new httpOnly cookies + new tokens in response)
 *   - NextAuth updates its session with the new tokens
 *
 * On failure:
 *   - Returns { ...token, error: "RefreshTokenExpired" } — NEVER null
 *   - Client middleware detects the error and redirects to /signIn
 *   - This avoids the "logout storm" caused by returning null
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    /**
     * Google Sync Provider
     *
     * Used ONLY after the Google OAuth redirect completes.
     * The backend has already set httpOnly cookies for access_token and refresh_token.
     * This provider reads those cookies server-side and creates a NextAuth session.
     *
     * Flow: Google OAuth → Auth Service → /success page → signIn('google-sync') → NextAuth session
     */
    Credentials({
      id: "google-sync",
      name: "Google Sync",
      credentials: {},
      authorize: async () => {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (!accessToken || !refreshToken) {
          console.error("[google-sync] Missing access_token or refresh_token cookie");
          return null;
        }

        try {
          const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.AUTH.ME}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            // Ensure fresh data, don't use cached response
            cache: "no-store",
          });

          if (!res.ok) {
            console.error("[google-sync] /auth/me failed:", res.status, res.statusText);
            return null;
          }

          const data = await res.json();

          if (!data?.id) {
            console.error("[google-sync] /auth/me returned no user id:", data);
            return null;
          }

          return {
            id: String(data.id),
            username: data.username ?? undefined,
            email: data.email ?? undefined,
            role: data.role ?? undefined,
            image: data.profilePicture ?? null,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          console.error("[google-sync] Token sync failed:", error);
          return null;
        }
      },
    }),

    /**
     * Credentials Provider (Email + Password)
     *
     * Calls the backend /auth/login endpoint.
     * The backend sets httpOnly cookies AND returns tokens in the JSON body.
     * NextAuth extracts tokens from the JSON body and stores them in its session.
     */
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "••••••",
        },
      },
      authorize: async (credentials) => {
        try {
          const res = await fetch(
            `${getApiBaseUrl()}${API_ROUTES.AUTH.LOGIN}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
              cache: "no-store",
            }
          );

          if (!res.ok) {
            let errorData: Record<string, any> = {};
            try {
              const text = await res.text();
              if (text) errorData = JSON.parse(text);
            } catch {
              errorData = { message: res.statusText || "Login failed" };
            }

            const backendMessage =
              errorData?.message ||
              errorData?.error ||
              (typeof errorData === "string" ? errorData : null);

            const msg = (backendMessage?.toLowerCase() || "");

            let errorCode = "login_failed";
            if (msg.includes("user not found")) errorCode = "user_not_found";
            else if (msg.includes("invalid credentials")) errorCode = "invalid_credentials";
            else if (msg.includes("blocked")) errorCode = "user_blocked";
            else if (msg.includes("google")) errorCode = "google_account_only";
            else if (msg.includes("verified email") || msg.includes("verify")) errorCode = "email_not_verified";
            else if (msg.includes("server error")) errorCode = "server_error";

            class LoginError extends CredentialsSignin {
              code = errorCode;
            }
            throw new LoginError();
          }

          const data = await res.json();

          if (!data?.user) {
            throw new Error("Invalid response from server");
          }

          // The backend returns tokens in the body so we can store them in NextAuth
          return {
            id: String(data.user.id),
            username: data.user.username ?? undefined,
            email: data.user.email ?? undefined,
            role: data.user.role ?? undefined,
            image: data.user.profilePicture ?? null,
            accessToken: data.user.accessToken,
            refreshToken: data.user.refreshToken,
          };
        } catch (err: any) {
          if (err instanceof CredentialsSignin) throw err;

          class GenericError extends CredentialsSignin {
            code = "something_went_wrong";
          }
          throw new GenericError();
        }
      },
    }),
  ],

  pages: {
    signIn: "/signIn",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days (matches refresh token lifetime)
  },

  callbacks: {
    /**
     * JWT Callback
     *
     * Called every time the session is accessed. Handles:
     * 1. Initial login: attaches user data and tokens to the JWT
     * 2. Session update: allows client-side session.update() calls
     * 3. Token refresh: proactively refreshes the access token before it expires
     *
     * CRITICAL: Never return null. Return { ...token, error: "RefreshTokenExpired" }
     * on failure. Returning null causes a "logout storm" where every subsequent
     * request redirects to /signIn before the page renders.
     */
    async jwt({ token, user, trigger, session }) {
      // 1. Handle explicit session update (e.g. profile picture change)
      if (trigger === "update" && session) {
        if (session.image !== undefined) token.image = session.image;
        if (session.username !== undefined) token.username = session.username;
        if (session.role !== undefined) token.role = session.role;
        return token;
      }

      // 2. Initial login — attach user data and tokens to the JWT
      if (user) {
        return {
          id: String(user.id),
          username: user.username ?? undefined,
          role: user.role ?? undefined,
          image: user.image ?? null,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          // Expire 1 minute early to avoid race conditions
          expiresAt: Date.now() + 14 * 60 * 1000,
          error: undefined,
        };
      }

      // 3. If we already have a refresh error, propagate it (don't loop)
      if (token.error === "RefreshTokenExpired") {
        return token;
      }

      // 4. Check if access token is still valid (with 1-minute buffer)
      const isTokenValid =
        token.expiresAt && Date.now() < (token.expiresAt as number);

      if (isTokenValid) {
        return token; // Token still valid, return as-is
      }

      // 5. No refresh token — cannot refresh
      if (!token.refreshToken) {
        console.error("[NextAuth JWT] No refresh token — marking session as expired");
        return { ...token, error: "RefreshTokenExpired" };
      }

      // 6. Attempt token refresh
      try {
        console.log("[NextAuth JWT] Access token expired — refreshing...");

        const res = await fetch(
          `${getApiBaseUrl()}${API_ROUTES.AUTH.REFRESH}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
            cache: "no-store",
            signal: AbortSignal.timeout(10_000),
          }
        );

        if (!res.ok) {
          const errorText = await res.text().catch(() => "");
          console.error("[NextAuth JWT] Refresh failed:", res.status, errorText);
          return { ...token, error: "RefreshTokenExpired" };
        }

        const data = await res.json();

        if (!data?.user?.accessToken) {
          console.error("[NextAuth JWT] Refresh response missing accessToken:", data);
          return { ...token, error: "RefreshTokenExpired" };
        }

        console.log("[NextAuth JWT] Token refreshed successfully");

        return {
          ...token,
          accessToken: data.user.accessToken,
          refreshToken: data.user.refreshToken ?? token.refreshToken,
          expiresAt: Date.now() + 14 * 60 * 1000,
          error: undefined,
        };
      } catch (err) {
        console.error("[NextAuth JWT] Token refresh threw:", err);
        return { ...token, error: "RefreshTokenExpired" };
      }
    },

    /**
     * Session Callback
     *
     * Exposes selected token fields to the client via useSession() / getServerSession().
     * Only expose what the client actually needs.
     */
    async session({ session, token }) {
      return {
        ...session,
        error: token.error,
        user: {
          ...session.user,
          id: String(token.id ?? ""),
          username: token.username ? String(token.username) : undefined,
          role: token.role ? String(token.role) : undefined,
          accessToken: token.accessToken ? String(token.accessToken) : undefined,
          refreshToken: token.refreshToken ? String(token.refreshToken) : undefined,
          image: token.image ? String(token.image) : null,
          error: token.error,
        },
      };
    },
  },
});
