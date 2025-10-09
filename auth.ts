
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
            `${process.env.LOCAL_APIGATEWAY_URL}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials?.email,
                password: credentials?.password,
              }),
            }
          );

          if (!res.ok) return null;

          const data = await res.json();

          return {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            role: data.user.role,
            image: data.user.profilePicture ?? null,
            accessToken: data.user.accessToken,
            refreshToken: data.user.refreshToken,
          };
        } catch (err) {
          console.error("Login failed:", err);
          return null;
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
        token.id = String(user.id);
        token.username = user.username ?? undefined;
        token.role = user.role ?? undefined;
        token.image = user.image ?? null;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.expiresAt = Date.now() + 15 * 60 * 1000; // example: 15 min
        return token;
      }

      // If still valid → return as is
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Otherwise refresh
      try {

        console.log('this is the refresh token -------------------------------------->','this is the token-->' , token , token.refreshToken)
        const res = await fetch(
          `${process.env.LOCAL_APIGATEWAY_URL}/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          }
        );

        if (!res.ok) throw new Error("Failed to refresh token");
        const data = await res.json();

        return {
          ...token,
          accessToken: data.user.accessToken,
          expiresAt: Date.now() + 15 * 60 * 1000,
        };
      } catch (err) {
        console.error("Token refresh failed:", err);
        return { ...token, error: "RefreshTokenError" };
      }
    },

    // ✅ Session callback: expose token data to client
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: String(token.id),
          username: token.username ? String(token.username) : undefined,
          role: token.role ? String(token.role) : undefined,
          accessToken: token.accessToken
            ? String(token.accessToken)
            : undefined,
          refreshToken: token.refreshToken
            ? String(token.refreshToken)
            : undefined,
          image: token.image ? String(token.image) : null, // <-- must be string | null
        },
      };
    },
  },
});
