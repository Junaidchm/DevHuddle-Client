// import  { DefaultSession, DefaultUser } from "next-auth";

// declare module "next-auth" {
//   // Extend User
//   interface User extends DefaultUser {
//     username?: string;
//     role?: string;
//     accessToken?: string;
//     refreshToken?: string;
//     image?: string ; 
//   }

//   // Extend Session
//   interface Session {
//     user: {
//       id?: string;
//       email?: string;
//       username?: string;
//       role?: string;
//       accessToken?: string;
//       refreshToken?: string;
//       image?: string ; 
//     } & DefaultSession["user"];
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     email: string;
//     username?: string;
//     role?: string;
//     accessToken?: string;
//     refreshToken?: string;
//   }
// }


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
    } & DefaultSession["user"];
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
  }
}
