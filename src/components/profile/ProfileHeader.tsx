// app/components/ProfileHeader.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import CoverImage from './CoverImage';
import UserInfo from './UserInfo';
import BasicStats from './BasicStats';
import SocialLinks from './SocialLinks';
import { UserProfile } from '@/src/types/user.type';
import { format } from 'date-fns';
import ProfileHeaderClient from './ProfileHeaderClient';
import { queryKeys } from '@/src/lib/queryKeys';

interface ProfileHeaderProps {
  username: string;
  initialProfile: UserProfile;
  currentUserId?: string;
}

const ProfileHeader = ({ username, initialProfile, currentUserId }: ProfileHeaderProps) => {
  // This component now owns the query state.
  // It reads from the cache hydrated by the server component.
  const { data: profile } = useQuery<UserProfile>({
    queryFn: () => Promise.resolve(initialProfile),
    queryKey: queryKeys.profiles.detail(username),
    initialData: initialProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isOwnProfile = currentUserId === profile.id;
  const joinedDate = profile.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : 'Unknown';

  return (
    <section className="bg-white p-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      <CoverImage />
      <div className="max-w-7xl mx-auto p-0 md:px-6">
        <div className="flex flex-wrap justify-between mb-8">
          <div className="flex gap-6 -mt-12 relative z-10 flex-1">
            <ProfileHeaderClient
              profile={profile}
              isOwnProfile={isOwnProfile}
            />
            
            <UserInfo
              name={profile.name}
              username={profile.username}
              role={profile.jobTitle || ''}
              bio={profile.bio || 'No bio available.'}
              location={profile.location || 'Unknown Location'}
              timezone={'UTC-8'} // This seems static, can be dynamic later
              joined={joinedDate}
              isVerified={profile.emailVerified || false}
              company={profile.company}
            />
          </div>
        </div>
        <div className="flex justify-between pb-6 border-b border-slate-200 flex-wrap gap-4">
          <SocialLinks links={[]} /> {/* Assuming social links will be added later */}
          <BasicStats
            following={profile._count.following.toString()}
            followers={profile._count.followers.toString()}
            projects={'0'} // Assuming projects count will be added later
          />
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;