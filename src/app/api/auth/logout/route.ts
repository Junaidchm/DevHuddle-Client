// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { API_ROUTES, getApiBaseUrl } from '../../../../constants/api.routes';

async function performLogout() {
  const session = await auth();

  if (session?.user?.accessToken) {
    try {
      await fetch(`${getApiBaseUrl()}${API_ROUTES.AUTH.LOGOUT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          refreshToken: session.user.refreshToken || null,
        }),
      });
      console.log("[LogoutRoute] Successfully blacklisted tokens on backend");
    } catch (error) {
      console.error("[LogoutRoute] Failed to notify backend of logout:", error);
    }
  }
}

export async function POST() {
  await performLogout();
  return NextResponse.json({ success: true });
}

export async function GET(request: Request) {
  await performLogout();
  
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/signIn';
  
  // Create response that deletes NextAuth cookies and redirects
  const response = NextResponse.redirect(new URL(callbackUrl, request.url));
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  
  return response;
}