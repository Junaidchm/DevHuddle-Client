// app/components/ProfileHeader.tsx
import CoverImage from './CoverImage';
import UserInfo from './UserInfo';
import BasicStats from './BasicStats';
import SocialLinks from './SocialLinks';
import ProfileHeaderClient from './ProfileHederClient';
import { UserProfile } from '@/src/types/user.type';
import { PROFILE_DEFAULT_URL } from '@/src/constents';
import { format } from 'date-fns';
import { useFollow } from "@/src/hooks/useFollow";

interface ProfileHeaderProps {
  username: string;
  initialProfile: UserProfile;
  currentUserId?: string;
}

const ProfileHeader = ({ username, initialProfile, currentUserId }: ProfileHeaderProps) => {
  const isOwnProfile = currentUserId === initialProfile.id;
  const joinedDate = initialProfile.createdAt ? format(new Date(initialProfile.createdAt), 'MMM yyyy') : 'Unknown';
  const {
    isFollowing,
    isPending,
    followerCount,
    toggleFollow,
  } = useFollow({
    userId: initialProfile.id,
    context: "profile",
    initialFollowerCount: initialProfile.followers ?? initialProfile._count?.followers,
    initialIsFollowing: initialProfile.isFollowedByUser,
  });

  return (
    <section className="bg-white p-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]">
      <CoverImage />
      <div className="max-w-7xl mx-auto p-0 md:px-6">
        <div className="flex flex-wrap justify-between mb-8">
          <div className="flex gap-6 -mt-12 relative z-10 flex-1">
            <ProfileHeaderClient
              username={username}
              initialProfile={initialProfile}
              currentUserId={currentUserId}
              isOwnProfile={isOwnProfile}
            />
            <UserInfo
              name={initialProfile.name}
              username={initialProfile.username}
              role={initialProfile.jobTitle || 'Developer'}
              bio={initialProfile.bio || 'No bio available.'}
              location={initialProfile.location || 'Unknown Location'}
              timezone={'UTC-8'} // This seems static, can be dynamic later
              joined={joinedDate}
              isVerified={initialProfile.emailVerified || false}
            />
          </div>
        </div>
        <div className="flex justify-between pb-6 border-b border-slate-200 flex-wrap gap-4">
          <SocialLinks links={[]} /> {/* Assuming social links will be added later */}
          <BasicStats
            following={initialProfile._count.following.toString()}
            followers={initialProfile._count.followers.toString()}
            projects={'0'} // Assuming projects count will be added later
          />
        </div>
      </div>
      <header className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          {/* avatar + name */}
          <img src={initialProfile.profilePicture || "/default.png"} className="w-20 h-20 rounded-full" alt={initialProfile.username} />
          <div>
            <h1 className="text-2xl font-semibold">{initialProfile.name || initialProfile.username}</h1>
            <p className="text-sm text-slate-600">@{initialProfile.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Custom profile-styled follow/unfollow button */}
          <button
            onClick={toggleFollow}
            disabled={isPending}
            className={
              isFollowing
                ? "border px-4 py-2 rounded-md text-sm bg-white text-slate-700 hover:bg-gray-50"
                : "bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            }
          >
            {isPending ? "..." : isFollowing ? "Following" : "Follow"}
          </button>

          {/* follower count display */}
          <div className="text-sm text-slate-700">
            <strong>{followerCount ?? initialProfile.followers ?? initialProfile._count?.followers}</strong>
            <span className="ml-1 text-slate-500">followers</span>
          </div>
        </div>
      </header>
    </section>
  );
};

export default ProfileHeader;