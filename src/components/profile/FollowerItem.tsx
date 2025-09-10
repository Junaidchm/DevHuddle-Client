
// app/components/FollowerItem.tsx
'use client';
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { followUser, unfollowUser } from '@/src/services/api/profile.service';

interface FollowerProps {
  id: string;
  imgSrc: string;
  name: string;
  username: string;
  role: string;
  alt: string;
  isFollowing: boolean;
  currentUserId?: string;
}

const FollowerItem = ({ id, imgSrc, name, username, role, alt, isFollowing, currentUserId }: FollowerProps) => {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: () => followUser(id),
    onMutate: async () => {
      await queryClient.cancelQueries(['followers']);
      const previousFollowers = queryClient.getQueryData(['followers']) || [];
      queryClient.setQueryData(['followers'], (old: any[]) => [...old, { id, username, isFollowing: true }]);
      return { previousFollowers };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['followers'], context?.previousFollowers);
      toast.error('Failed to follow');
    },
    onSettled: () => queryClient.invalidateQueries(['followers']),
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(id),
    onMutate: async () => {
      await queryClient.cancelQueries(['followers']);
      const previousFollowers = queryClient.getQueryData(['followers']) || [];
      queryClient.setQueryData(['followers'], (old: any[]) => old.filter((f) => f.id !== id));
      return { previousFollowers };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['followers'], context?.previousFollowers);
      toast.error('Failed to unfollow');
    },
    onSettled: () => queryClient.invalidateQueries(['followers']),
  });

  return (
    <div className="p-5 border-b border-slate-100 last:border-b-0 flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img src={imgSrc} alt={alt} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-semibold text-slate-800 mb-1">{name}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{username}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-sm text-slate-500">{role}</span>
          </div>
        </div>
      </div>
      {currentUserId && currentUserId !== id && (
        <div className="flex gap-3">
          <button className="bg-white border border-slate-200 text-blue-500 py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
            Message
          </button>
          <button
            className={`py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 ${isFollowing ? 'bg-gray-200 text-gray-500 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            onClick={() => (isFollowing ? unfollowMutation.mutate() : followMutation.mutate())}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FollowerItem;
