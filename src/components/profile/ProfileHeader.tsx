// app/components/ProfileHeader.tsx
import CoverImage from './CoverImage';
import UserInfo from './UserInfo';
import BasicStats from './BasicStats';
import SocialLinks from './SocialLinks';
import ProfileHeaderClient from './ProfileHederClient';

interface ProfileHeaderProps {
  username: string;
  initialProfile: any; // Pre-fetched profile data
  currentUserId?: string;
}

const ProfileHeader = ({ username, initialProfile, currentUserId }: ProfileHeaderProps) => {
  const isOwnProfile = currentUserId === initialProfile?.id;

  return (
    <section className="bg-white p-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      <CoverImage />
      <div className="max-w-7xl mx-auto p-0 md:px-6">
        <div className="flex flex-wrap justify-between mb-8">
          <div className="flex gap-6 -mt-12 relative z-10 flex-1">
            <ProfileHeaderClient
              initialProfile={initialProfile}
              currentUserId={currentUserId}
            />
            <UserInfo
              name={initialProfile?.name || 'Unknown'}
              username={initialProfile?.username || 'unknown'}
              role={initialProfile?.role || 'Unknown Role'}
              bio={initialProfile?.bio || 'No bio available'}
              location={initialProfile?.location || 'Unknown'}
              timezone={initialProfile?.timezone || 'UTC-8'}
              joined={initialProfile?.joined || 'Unknown'}
              isVerified={initialProfile?.isVerified || false}
            />
          </div>
          {/* ActionButtons will be rendered in ProfileHeaderClient */}
        </div>
        <div className="flex justify-between pb-6 border-b border-slate-200 flex-wrap gap-4">
          <SocialLinks links={initialProfile?.socialLinks || []} />
          <BasicStats
            following={initialProfile?.followingCount || '0'}
            followers={initialProfile?.followersCount || '0'}
            projects={initialProfile?.projectsCount || '0'}
          />
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;