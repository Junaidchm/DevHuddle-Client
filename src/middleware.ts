import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/signIn", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/","/profile/:path*"],
};
