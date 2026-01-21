"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/src/store/store';
import { GetUser } from '@/src/store/actions/authActions';

export default function AuthCallback() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Fetch user data after OAuth callback sets cookies
        await dispatch(GetUser()).unwrap();
        await new Promise((res,rej)=> setTimeout(res,1000))
        router.push('/');
      } catch (err) {
        router.push('/login?error=OAuth%20failed');
      }
    };
    handleCallback();
  }, [dispatch, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <p className="text-base sm:text-lg text-gray-900">Processing authentication...</p>
    </div>
  );
}