// lib/auth.ts
"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { parse } from "cookie";
import { JwtPayload } from "../types";

// Environment variables
const API_URL = process.env.API_URL || "http://localhost:8000";
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

// Singleton promise for concurrent refresh handling
let refreshPromise: Promise<string | null> | null = null;

// Cookie options for dev/prod
const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "none" as const,
  secure: process.env.NODE_ENV === "production",
};

// Decode JWT (no signature check, for quick inspection)
const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};

// Verify JWT (checks signature and exp)
const verifyToken = (token: string, secret: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
};

// Get session (verifies token, returns status for refresh/logout)
export async function getSession(): Promise<{
  session: JwtPayload | null;
  needsRefresh: boolean;
  needsLogout: boolean;
  refreshToken?: string;
}> {
  try {
    const cookieStore = await cookies();
    let accessToken: string | null =
      cookieStore.get("access_token")?.value ?? null;

     console.log('this is the access token -------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', accessToken )

    if (!accessToken) {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get("refresh_token")?.value;
      return {
        session: null,
        needsRefresh: true,
        needsLogout: false,
        refreshToken,
      };
    }

    const session = verifyToken(accessToken, ACCESS_SECRET);

    console.log('this is the session chekcing ............=============================================', session)

    if (!session) {
      return { session: null, needsRefresh: true, needsLogout: false };
    }

    return { session, needsRefresh: false, needsLogout: false };
  } catch (error: any) {
    console.log(error);
    throw new Error(error.message);
  }
}



export async function serverFetchSilent(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const session = await getSession();

  console.log('this is the session details -------------------------', session)
  if (session.needsRefresh) {

    console.log("serverFetchSilent is working without any problem ======================================", options)

    const refreshRes = await fetch(
      `${API_URL}/api/auth/refresh-token`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!refreshRes.ok) {
      throw new Error("Session expired");
    }

    const { accessToken } = await refreshRes.json();
    if (!accessToken) {
      throw new Error("No access token after refresh");
    }
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refresToken = cookieStore.get("refresh_token")?.value;
  if (!accessToken) {
    throw new Error("No access token");
  }
  
  
  let response = await fetch(`${process.env.API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: `access_token=${accessToken};refresh_token=${refresToken}`,
    },
  });
   
  return response
  
}
