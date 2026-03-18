// app/components/ProfileHeader.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CoverImage from './CoverImage';
import SocialLinks from './SocialLinks';
import { UserProfile } from '@/src/types/user.type';
import React from 'react';
import ProfileTabs from './ProfileTabs';
import { format } from 'date-fns';
import { queryKeys } from '@/src/lib/queryKeys';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { createUploadSession, uploadFileToR2, completeUpload, MediaType } from '@/src/services/api/media.service';
import { updateProfile } from '@/src/services/api/auth.service';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import FollowersSection from './FollowersSection';
import RecentPosts from './RecentPosts';
import RecentProjects from './RecentProjects';

import { api } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/constants/api.routes';
import { Card } from '../ui/card';
import Avatar from './Avatar';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Pencil, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { PROFILE_DEFAULT_URL } from '@/src/constants';
import { FollowButton } from '../FollowButton';
import { useToast } from '../ui/use-toast';

interface ProfileHeaderProps {
  username: string;
  initialProfile: UserProfile;
  currentUserId?: string;
}

const ProfileHeader = ({ username, initialProfile, currentUserId }: ProfileHeaderProps) => {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { mutate: uploadCover, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      // 1. Create upload session
      const session = await createUploadSession({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        mediaType: "COVER_IMAGE" as MediaType, // Cast if strictly typed and backend sync is pending
      }, authHeaders as Record<string, string>);

      // 2. Upload to R2
      await uploadFileToR2(file, session.uploadUrl);

      // 3. Complete upload
      const completed = await completeUpload(session.mediaId, authHeaders as Record<string, string>);

      // 4. Update profile
      await updateProfile({ coverImage: completed.cdnUrl }, authHeaders as Record<string, string>);
      
      return completed.cdnUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(username) });
    },
    onError: (error: any) => {
        console.error("Cover upload failed", error);
        toast({
          title: "Failed to update cover photo",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Cover image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      uploadCover(file);
    }
  };

  const { data: profile } = useQuery<UserProfile>({
    queryFn: async () => {
      const data = await api.get<UserProfile>(API_ROUTES.USERS.PROFILE_BY_USERNAME(username));
      return data;
    },
    queryKey: queryKeys.profiles.detail(username),
    initialData: initialProfile,
    enabled: !!username,
    // staleTime: 5 * 60 * 1000, // Remove staleTime to allow invalidation to trigger refetch immediately if needed, or keep it but invalidation overrides it?
    // In React Query, invalidateQueries marks it as stale and refetches. So staleTime is fine for general background refetching, 
    // but the issue was the queryFn NOT fetching.
    // However, for immediate "optimistic-like" feel on invalidation, we want to ensure it refetches.
  });

  const isOwnProfile = currentUserId === profile.id;
  const joinedDate = profile.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : 'Unknown';

  const [activeTab, setActiveTab] = React.useState('posts');
  const router = useRouter();

  return (
    <div className="max-w-[1128px] mx-auto px-4 md:px-0 py-4 grid grid-cols-1 lg:grid-cols-4 gap-6">

      {/* Left Sidebar (Main Profile Card) - Spans 3 columns on large screens */}
      {/* ... (omitted for brevity, no changes here) */}
      <div className="lg:col-span-3 space-y-4">

        {/* Profile Card */}
        <Card className="rounded-lg shadow-sm border border-border overflow-hidden relative">
            {/* Same content as before */}
            <div className="relative h-[150px] sm:h-[201px] w-full bg-[#A0B4B7]">
                <CoverImage 
                    src={profile.coverImage} 
                    editable={isOwnProfile && !isUploading} 
                    onEdit={() => fileInputRef.current?.click()}
                />
                {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 transition-opacity">
                        <div className="flex flex-col items-center gap-2">
                             <Loader2 className="w-8 h-8 text-white animate-spin" />
                             <span className="text-white text-sm font-medium">Updating cover...</span>
                        </div>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            <div className="px-4 sm:px-6 pb-6 relative">
                 {/* Avatar overlapping cover */}
                 <div className="absolute -top-12 sm:-top-[100px] left-4 sm:left-6">
                    <div className="rounded-full p-0.5 bg-background">
                         <Avatar 
                             src={profile.profilePicture || PROFILE_DEFAULT_URL} 
                             alt={profile.name} 
                             className="w-24 h-24 sm:w-[152px] sm:h-[152px] border-4 border-background shadow-md"
                         />
                    </div>
                </div>

                {/* Actions (Top Right) */}
                <div className="flex justify-end pt-4 mb-2">
                     {isOwnProfile ? (
                        <div className="flex gap-2">
                            {/* <Button variant="outline" className="rounded-full" onClick={() => {}}>
                                I'm Open To
                            </Button> */}
                            <Button 
                                variant="outline" 
                                className="rounded-full text-primary border-primary hover:bg-primary/10 hover:border-primary-hover hover:text-primary-hover font-semibold"
                                onClick={() => router.push(`/profile/update/${profile.username}`)}
                                disabled={isUploading}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pencil className="w-4 h-4 mr-2" />}
                                Edit profile
                            </Button>
                        </div>
                     ) : (
                         <FollowButton userId={profile.id} isFollowing={profile.isFollowing!} />
                     )}
                </div>

                {/* Profile Info */}
                <div className="mt-8 flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
                            {profile.emailVerified && <span className="text-muted-foreground text-sm" title="Verified">(Verified)</span>}
                        </div>
                         
                        <p className="text-base text-foreground mt-1 max-w-[600px] break-words">
                            {profile.bio || profile.jobTitle || 'No headline available'}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>}
                            <span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {joinedDate}</span>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-4 text-sm font-bold text-primary hover:text-primary-hover cursor-pointer">
                           <span>{profile._count.followers} followers</span>
                           <span>{profile._count.following} following</span>
                        </div>
                    </div>
                    {/* Could add current company/school logos here on the right */}
                </div>
                
                {/* Nav Tabs */}
                {/* <div className="mt-4 border-t border-border pt-1"> */}
                <div className="mt-4 pt-1">
                    <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
            </div>
        </Card>

        {/* Tab Content Areas (Activity/Network) */}
        <div className="min-h-[100px]">
            {activeTab === 'posts' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground px-1">Activity</h3>
                    <RecentPosts userId={profile.id} username={profile.username} isOwnProfile={isOwnProfile} />
                </div>
            )}

            {activeTab === 'projects' && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground px-1">Projects</h3>
                    <RecentProjects userId={profile.id} username={profile.username} isOwnProfile={isOwnProfile} />
                </div>
            )}

            {activeTab === 'network' && (
                <Card className="rounded-lg shadow-sm border border-border p-6">
                    <div className="space-y-6">
                        <FollowersSection
                            username={profile.username}
                            currentUserId={currentUserId}
                            initialProfile={profile}
                        />
                    </div>
                </Card>
            )}
        </div>

        {/* Experience Section */}
        <ExperienceSection 
            experience={profile.experience || []} 
            isOwnProfile={isOwnProfile}
            username={username}
        />

        {/* Education Section */}
        <EducationSection 
            education={profile.education || []} 
            isOwnProfile={isOwnProfile} 
            username={username}
        />

        {/* Skills Section */}
        <SkillsSection 
            skills={profile.skills || []} 
            isOwnProfile={isOwnProfile} 
            username={username}
        />
      </div>

       {/* Right Sidebar - Analytics & Suggestions */}
      <div className="lg:col-span-1 space-y-4">
        {/* Placeholder for "People also viewed" or similar */}
      </div>

    </div>
  );
};

export default ProfileHeader;