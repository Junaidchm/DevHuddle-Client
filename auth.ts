
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API_ROUTES, getApiBaseUrl } from "./src/constants/api.routes";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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
            const errorMessage = errorData?.message || errorData?.error || `Login failed (${res.status})`;
            
            // Log for debugging
            console.error("Login error response:", {
              status: res.status,
              statusText: res.statusText,
              errorData,
              message: errorMessage,
            });
            
            throw new Error(errorMessage);
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
          // Return error message that will be shown to user
          throw new Error(err?.message || "Login failed. Please check your credentials.");
        }
      },
    }),
  ],

   pages: {
    signIn: "/signIn",   // 👈 This is where unauthenticated users will be sent
  },

  session: {
    strategy: "jwt", // important for refresh handling
  },

  callbacks: {
    
    async jwt({ token, user }) {
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

      // If no token or no refreshToken, return null (sign out)
      if (!token || !token.refreshToken) {
        return null;
      }

      // If token is still valid → return as is
      if (token.expiresAt && Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Otherwise try to refresh (only if refreshToken exists)
      if (!token.refreshToken) {
        return null; // No refresh token, sign out
      }

      try {
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
              ? { signal: AbortSignal.timeout(5000) }
              : {}),
          }
        );

        if (!res.ok) {
          throw new Error(`Refresh failed with status ${res.status}`);
        }

        const data = await res.json();
        
        if (!data?.user?.accessToken) {
          throw new Error("No access token in refresh response");
        }

        return {
          ...token,
          accessToken: data.user.accessToken,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
        };
      } catch (err) {
        console.error("Token refresh failed:", err);
        // Return null to sign the user out and prevent infinite refresh loop
        return null;
      }
    },

    // ✅ Session callback: expose token data to client
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
