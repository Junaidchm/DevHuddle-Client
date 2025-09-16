// app/api/auth/refresh-token/route.ts
import { cookies } from "next/headers";
import { parse } from "cookie";

const API_URL = process.env.API_URL as string;

export async function GET() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return Response.json({ error: "No refresh token" }, { status: 401 });
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "GET",
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });

  if (!response.ok) {
    return Response.json({ error: "Refresh failed" }, { status: 401 });
  }

  const setCookieHeader = response.headers.get("set-cookie");
  if (!setCookieHeader) {
    return Response.json({ error: "No set-cookie header" }, { status: 401 });
  }

  const parsed = parse(setCookieHeader);
  const newAccessToken = parsed.access_token;

  if (newAccessToken) {
    cookieStore.set("access_token", newAccessToken, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60,
    });
  }

  return Response.json({ accessToken: newAccessToken });
}