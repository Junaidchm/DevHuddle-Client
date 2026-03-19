
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { API_ROUTES, getApiBaseUrl } from "./src/constants/api.routes";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "******",
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
            }
          );

          if (!res.ok) {
            // Try to get error message from response
            let errorData: any = {};
            try {
              const text = await res.text();
              if (text) {
                errorData = JSON.parse(text);
              }
            } catch (parseError) {
              // If JSON parsing fails, use status text
              errorData = { message: res.statusText || "Login failed" };
            }

            // Extract the exact error message from the backend
            // API Gateway sends: { status: number, message: string }
            // Auth service might send: { message: string } or { error: string }
            // Extract the exact error message from the backend
            // API Gateway sends: { status: number, message: string }
            // Auth service might send: { message: string } or { error: string }
            const backendMessage = errorData?.message ||
              errorData?.error ||
              (typeof errorData === 'string' ? errorData : null);

            // Map backend messages to specific error codes
            let errorCode = "login_failed";
            
            // Normalize message for comparison
            const msg = backendMessage?.toLowerCase() || "";
            
            if (msg.includes("user not found")) {
              errorCode = "user_not_found";
            } else if (msg.includes("invalid credentials")) {
              errorCode = "invalid_credentials";
            } else if (msg.includes("blocked")) {
              errorCode = "user_blocked";
            } else if (msg.includes("google")) {
              errorCode = "google_account_only";
            } else if (msg.includes("verified email")) {
              errorCode = "email_not_verified";
            } else if (msg.includes("internel server error") || msg.includes("server error")) {
              errorCode = "server_error";
            }
            
            // Throw error with the specific code
            class InvalidLoginError extends CredentialsSignin {
              code = errorCode;
            }
            throw new InvalidLoginError();
          }

          const data = await res.json();

          // Validate that user data exists
          if (!data?.user) {
            throw new Error("Invalid response from server");
          }

          return {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            image: data.user.profilePicture ?? null,
            accessToken: data.user.accessToken,
            refreshToken: data.user.refreshToken,
          };
        } catch (err: any) {
          console.error("Login failed:", err);
          
          // If it's already a CredentialsSignin (our custom error), rethrow it
          if (err instanceof CredentialsSignin) {
            throw err;
          }
          
          class GenericLoginError extends CredentialsSignin {
              code = "something_went_wrong";
          }
          throw new GenericLoginError();
        }
      },
    }),
  ],

  pages: {
    signIn: "/signIn",   // 👈 This is where unauthenticated users will be sent
  },

  session: {
    strategy: "jwt", // important for refresh handling
    maxAge: 7 * 24 * 60 * 60,
  },

  callbacks: {

    async jwt({ token, user, account, trigger, session }) {
      // Handle session update via useSession().update()
      if (trigger === "update" && session) {
        // Update user image if provided
        if (session.inputImage) token.image = session.inputImage;
        // Allows updating other fields if needed
        if (session.name) token.name = session.name;
        // Add other fields you might want to update here
        return token;
      }

      // Initial Google Login -> Sync with Backend
      if (account?.provider === "google" && user) {
        console.log("[NextAuth JWT] Initial Google Login Entry", { userEmail: user.email });
        try {
          const apiBaseUrl = getApiBaseUrl();
          const res = await fetch(`${apiBaseUrl}/api/v1/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: user.id || account.providerAccountId,
              email: user.email,
              name: user.name,
              username: user.email?.split("@")[0] || user.name,
            }),
          });
          
          if (!res.ok) {
            const errorText = await res.text();
            console.error("[NextAuth] Backend Google login failed", {
              status: res.status,
              statusText: res.statusText,
              error: errorText
            });
            return null; // Force sign out if we can't sync with backend
          }
          
          const data = await res.json();
          console.log("[NextAuth] Backend Google login successful", { userId: data.jwtpayload?.id });
          return {
            id: String(data.jwtpayload.id),
            username: data.jwtpayload.username ?? undefined,
            role: data.jwtpayload.role ?? undefined,
            image: data.jwtpayload.image ?? user.image ?? null,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
          };
        } catch (err) {
          console.error("[NextAuth] Backend Google error", err);
          return null;
        }
      }

      // Initial Credentials Login
      if (user && account?.provider === "credentials") {
        return {
          id: String(user.id),
          username: user.username ?? undefined,
          role: user.role ?? undefined,
          image: user.image ?? null,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
      }

      // ✅ FIXED: Refresh token before it expires (5 minutes buffer)
      // This prevents 401 errors by refreshing proactively
      const shouldRefresh = token.expiresAt && Date.now() >= ((token.expiresAt as number) - 5 * 60 * 1000);

      // If no token or no refreshToken, return null (sign out)
      if (!token || !token.refreshToken) {
        return null;
      }

      // ✅ BLOCK CHECK: On every token validation (page nav / session read),
      // check if the user has been blocked by admin. This is the ONLY way to
      // enforce instant block across all pages, not just API calls.
      if (!shouldRefresh && token.expiresAt && Date.now() < (token.expiresAt as number)) {
        try {
          const apiBaseUrl = getApiBaseUrl();
          const checkRes = await fetch(`${apiBaseUrl}${API_ROUTES.AUTH.ME}`, {
            headers: { Authorization: `Bearer ${token.accessToken}` },
            // Short timeout — we don't want this to block navigation
            ...(typeof AbortSignal !== "undefined" && AbortSignal.timeout
              ? { signal: AbortSignal.timeout(3000) }
              : {}),
          });

          if (checkRes.status === 401 || checkRes.status === 403) {
            let body: any = {};
            try { body = await checkRes.json(); } catch {}
            const msg = (body?.message || "").toLowerCase();
            if (msg.includes("blocked")) {
              console.warn("[NextAuth JWT] User is blocked by admin. Forcing sign out.");
              return { ...token, error: "UserBlocked" };
            }
          }
        } catch (e) {
          // Network error / timeout — don't block navigation, just carry on.
          // The API gateway will handle enforcing the block on actual API calls.
          console.warn("[NextAuth JWT] Block check failed (network/timeout), skipping.", e);
        }
        return token;
      }

      try {
        console.log("[NextAuth JWT] Attempting to refresh token...");
        const apiBaseUrl = getApiBaseUrl();
        if (!apiBaseUrl) {
          throw new Error("API base URL not configured");
        }

        const res = await fetch(
          `${apiBaseUrl}${API_ROUTES.AUTH.REFRESH}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
            // Add timeout to prevent hanging (Node 18+)
            ...(typeof AbortSignal !== "undefined" && AbortSignal.timeout
              ? { signal: AbortSignal.timeout(10000) } // Increased to 10 seconds
              : {}),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[NextAuth JWT] Refresh failed:", {
            status: res.status,
            statusText: res.statusText,
            error: errorText,
          });
          throw new Error(`Refresh failed with status ${res.status}: ${errorText}`);
        }

        const data = await res.json();

        if (!data?.user?.accessToken) {
          console.error("[NextAuth JWT] No access token in refresh response:", data);
          throw new Error("No access token in refresh response");
        }

        console.log("[NextAuth JWT] Token refreshed successfully");
        return {
          ...token,
          accessToken: data.user.accessToken,
          // Update refreshToken if provided (some backends rotate refresh tokens)
          refreshToken: data.user.refreshToken || token.refreshToken,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
      } catch (err) {
        console.error("[NextAuth JWT] Token refresh failed:", err);
        // Return null to sign the user out and prevent infinite refresh loop
        return null;
      }
    },

    //  Session callback: expose token data to client
    async session({ session, token }) {
      // If token is null or invalid, return empty session
      if (!token || !token.id) {
        return {
          ...session,
          user: {
            ...session.user,
            id: "",
          },
        };
      }

      return {
        ...session,
        error: token.error, // Expose error to client (e.g., 'UserBlocked')
        user: {
          ...session.user,
          id: String(token.id || ""),
          username: token.username ? String(token.username) : undefined,
          role: token.role ? String(token.role) : undefined,
          accessToken: token.accessToken
            ? String(token.accessToken)
            : undefined,
          refreshToken: token.refreshToken
            ? String(token.refreshToken)
            : undefined,
          image: token.image ? String(token.image) : null,
        },
      };
    },
  },
});





