// app/components/ProfileHeaderClient.tsx
'use client';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Avatar from './Avatar';
import ActionButtons from './ActionButtons';
import { PROFILE_DEFAULT_URL } from '@/src/constents';
import toast from 'react-hot-toast';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { UserProfile } from '@/src/types/user.type';
import { followUser, unfollowUser } from '@/src/services/api/follow.service';
import { fetchProfileByUsername } from '@/src/services/api/profile.service';

interface ProfileHeaderClientProps {
  username: string;
  initialProfile: UserProfile;
  currentUserId?: string;
  isOwnProfile: boolean;
}

const ProfileHeaderClient = ({ username, initialProfile, currentUserId, isOwnProfile }: ProfileHeaderClientProps) => {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();

  const { data: profile } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchProfileByUsername(username, authHeaders),
    initialData: initialProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const followMutation = useMutation({
    mutationFn: () => followUser(profile.id, authHeaders),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['profile', username] });
      const previousProfile = queryClient.getQueryData<UserProfile>(['profile', username]);
      if (previousProfile) {
        const updatedProfile = {
          ...previousProfile,
          isFollowing: true,
          _count: { ...previousProfile._count, followers: previousProfile._count.followers + 1 },
        };
        queryClient.setQueryData(['profile', username], updatedProfile);
      }
      return { previousProfile };
    },
    onError: (err, _, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', username], context.previousProfile);
      }
      toast.error('Failed to follow user.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => unfollowUser(profile.id, authHeaders),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['profile', username] });
      const previousProfile = queryClient.getQueryData<UserProfile>(['profile', username]);
      if (previousProfile) {
        const updatedProfile = {
          ...previousProfile,
          isFollowing: false,
          _count: { ...previousProfile._count, followers: previousProfile._count.followers - 1 },
        };
        queryClient.setQueryData(['profile', username], updatedProfile);
      }
      return { previousProfile };
    },
    onError: (err, _, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', username], context.previousProfile);
      }
      toast.error('Failed to unfollow user.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
    },
  });

  return (
    <>
      <Avatar imgSrc={profile.profilePicture || PROFILE_DEFAULT_URL} alt={profile.name} />
      <ActionButtons
        username={username}
        userId={profile.id}
        isOwnProfile={isOwnProfile}
        isFollowing={profile.isFollowing}
        onFollow={() => followMutation.mutate()}
        onUnfollow={() => unfollowMutation.mutate()}
        isPending={followMutation.isPending || unfollowMutation.isPending}
      />
    </>
  );
};

export default ProfileHeaderClient;