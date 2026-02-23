"use client"

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get('redirect');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Use the google-sync provider to hydrate NextAuth from backend cookies
        const res = await signIn('google-sync', { redirect: false });
        
        if (res?.error) {
           router.push('/signIn?error=OAuth%20sync%20failed');
        } else {
           // Successfully synced
           // Using window.location instead of router.push to prevent Next.js layout CSS
           // chunk load 404 caching errors after OAuth redirect.
           window.location.href = redirectParams || '/';
        }
      } catch (err) {
        router.push('/signIn?error=OAuth%20failed');
      }
    };
    handleCallback();
  }, [router, redirectParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <p className="text-base sm:text-lg text-gray-900">Processing authentication...</p>
    </div>
  );
}