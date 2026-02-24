
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API_ROUTES, getApiBaseUrl } from "./src/constants/api.routes";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "google-sync",
      name: "Google Sync",
      credentials: {},
      authorize: async () => {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;
        const refreshToken = cookieStore.get("refresh_token")?.value;

        if (!accessToken) return null;

        try {
          const res = await fetch(`${getApiBaseUrl()}${API_ROUTES.AUTH.ME}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!res.ok) return null;

          const data = await res.json();
          
          // /auth/me returns the user object directly, not wrapped in { user: ... }
          if (!data?.id) return null;

          return {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role,
            image: data.profilePicture ?? null,
            accessToken,
            refreshToken,
          };
        } catch (error) {
          console.error("Token sync failed", error);
          return null;
        }
      },
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

    async jwt({ token, user, trigger, session }) {
      // Handle session update via useSession().update()
      if (trigger === "update" && session) {
        // Update user image if provided
        if (session.inputImage) token.image = session.inputImage;
        // Allows updating other fields if needed
        if (session.name) token.name = session.name;
        // Add other fields you might want to update here
        return token;
      }

      // On first login → attach tokens
      if (user) {
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

      // Otherwise try to refresh (only if refreshToken exists)
      if (!token.refreshToken) {
        console.error("[NextAuth JWT] No refresh token available");
        return null; // No refresh token, sign out
      }

      // Only return if token is valid AND we don't need to refresh yet
      if (!shouldRefresh && token.expiresAt && Date.now() < (token.expiresAt as number)) {
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
