import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  // Extend User interface
  interface User extends DefaultUser {
    id: string;
    username?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    image?: string | null;
  }

  // Extend Session interface
  interface Session {
    user: {
      id: string;
      username?: string;
      role?: string;
      accessToken?: string;
      refreshToken?: string;
      image?: string | null;
      /** Set to 'RefreshTokenExpired' when refresh token is invalid/expired */
      error?: string;
    } & DefaultSession["user"];
    /** Session-level error (mirrors user.error for easy access) */
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    image?: string | null;
    /** Unix timestamp (ms) when access token expires */
    expiresAt?: number;
    /** Set to 'RefreshTokenExpired' when refresh fails — triggers client-side sign-out */
    error?: string;
  }
}
