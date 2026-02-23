// app/auth/logout/route.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(request.url);
  const callbackUrl = searchParams.get('callbackUrl') || '/signIn';

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  
  redirect(callbackUrl);
}