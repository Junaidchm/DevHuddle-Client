// app/api/auth/refresh/route.ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parse } from "cookie";

const API_URL = process.env.API_URL as string;

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") || "/";

  if (!refreshToken) {
    return redirect("/api/auth/logout");
  }

  // Call API Gateway
  const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { Cookie: `refresh_token=${refreshToken}` },
  });

  if (!response.ok) {
    return redirect("/api/auth/logout");
  }

  const setCookieHeader = response.headers.get("set-cookie");
  if (!setCookieHeader) {
    return redirect("/api/auth/logout");
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

  // ✅ Send the browser back where it was
  redirect(returnTo);
}
