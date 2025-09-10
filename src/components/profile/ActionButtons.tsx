// app/components/ActionButtons.tsx
'use client';
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const ActionButtons = ({ userId, isOwnProfile }: { userId?: string; isOwnProfile: boolean }) => {
  const router = useRouter();

//   const logoutMutation = useMutation({
//     mutationFn: logout,
//     onSuccess: () => {
//       router.push('/login');
//     },
//   });

  return (
    <div className="flex flex-col gap-3 mt-6 min-w-[150px]">
      {isOwnProfile && (
        <button
          className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-none py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 hover:opacity-90"
          onClick={() => alert('Edit Profile clicked')}
        >
          Edit Profile
        </button>
      )}
      <button
        className="bg-white text-slate-500 border border-slate-200 py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
        onClick={() => navigator.clipboard.writeText(window.location.href)}
      >
        Share Profile
      </button>
      {isOwnProfile && (
        <button
          className="bg-red-500 text-white border-none py-2.5 px-5 rounded-lg font-medium cursor-pointer transition-all duration-200 text-sm flex items-center justify-center gap-2 hover:bg-red-600"
        //   onClick={() => logoutMutation.mutate()}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default ActionButtons;