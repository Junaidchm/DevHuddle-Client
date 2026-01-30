// app/components/ProfileHeader.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CoverImage from './CoverImage';
import UserInfo from './UserInfo';
import BasicStats from './BasicStats';
import SocialLinks from './SocialLinks';
import { UserProfile } from '@/src/types/user.type';
import React from 'react';
import ProfileTabs from './ProfileTabs';
import ActivitySection from './ActivitySection';
import ProfileAnalytics from './ProfileAnalytics';
import { format } from 'date-fns';
import ProfileHeaderClient from './ProfileHeaderClient';
import { queryKeys } from '@/src/lib/queryKeys';
import { useAuthHeaders } from '@/src/customHooks/useAuthHeaders';
import { createUploadSession, uploadFileToR2, completeUpload, MediaType } from '@/src/services/api/media.service';
import { updateProfile } from '@/src/services/api/auth.service';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import SkillsSection from './SkillsSection';
import FollowersSection from './FollowersSection';

import { api } from '@/src/lib/api-client';
import { API_ROUTES } from '@/src/constants/api.routes';

interface ProfileHeaderProps {
  username: string;
  initialProfile: UserProfile;
  currentUserId?: string;
}

const ProfileHeader = ({ username, initialProfile, currentUserId }: ProfileHeaderProps) => {
  const queryClient = useQueryClient();
  const authHeaders = useAuthHeaders();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
    onError: (error) => {
        console.error("Cover upload failed", error);
        alert("Failed to update cover photo");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
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

  const [activeTab, setActiveTab] = React.useState('network');

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 lg:px-6 py-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Left Sidebar (Main Profile Card) - Spans 3 columns on large screens */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="relative">
                <CoverImage 
                    src={profile.coverImage} 
                    editable={isOwnProfile} 
                    onEdit={() => fileInputRef.current?.click()}
                />
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                
                {/* Avatar overlapping cover */}
                <div className="absolute -bottom-16 left-6">
                <div className="rounded-full p-1 bg-white">
                    <ProfileHeaderClient
                        profile={profile}
                        isOwnProfile={isOwnProfile}
                    />
                </div>
                </div>
            </div>

            {/* Profile Info & Actions */}
            <div className="pt-20 px-6 pb-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        {/* Name & verification */}
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                            {profile.emailVerified && <span className="text-blue-500" title="Verified">✓</span>}
                        </div>
                        <p className="text-gray-500 text-sm">@{profile.username}</p>
                        
                        {/* Headline/Bio */}
                        <p className="text-gray-900 mt-2 text-base">{profile.bio || profile.jobTitle || 'No headline available'}</p>
                        
                        {/* Location & Meta */}
                        <div className="flex items-center gap-4 mt-2 text-gray-500 text-sm">
                            {profile.location && <span>📍 {profile.location}</span>}
                            <span>📅 Joined {joinedDate}</span>
                        </div>
                        
                        {/* Connection Count */}
                        <div className="mt-2 text-purple-600 font-semibold text-sm hover:underline cursor-pointer">
                            {profile._count.followers} followers • {profile._count.following} following
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {isOwnProfile ? (
                            <>
                                {/* <button className="px-4 py-1.5 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition">
                                    Edit Profile
                                </button> */}
                                {/* <button className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-full font-semibold hover:bg-gray-50 transition">
                                    Share Profile
                                </button> */}
                            </>
                        ) : (
                            <button className="px-6 py-1.5 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition">
                                Follow
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Nav Tabs */}
                <div className="mt-2">
                    <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
                </div>
            </div>
        </div>


         {/* Tab Content Areas (Activity/Network) */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 min-h-[300px]">
            {activeTab === 'posts' && (
                <>
                    <h3 className="text-lg font-semibold mb-4">Activity</h3>
                    <ActivitySection type="posts" userId={profile.id} currentUserId={currentUserId} />
                </>
            )}

            {activeTab === 'comments' && (
                <>
                    <h3 className="text-lg font-semibold mb-4">Comments</h3>
                    <ActivitySection type="comments" userId={profile.id} currentUserId={currentUserId} />
                </>
            )}

            {activeTab === 'network' && (
                <div className="space-y-6">
                    <FollowersSection
                        username={profile.username}
                        currentUserId={currentUserId}
                        initialProfile={profile}
                    />
                </div>
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
      {/* <div className="lg:col-span-1 space-y-4">
         {isOwnProfile && (
             <ProfileAnalytics 
                profileViews={42} // Dummy data
                searchImpressions={15} // Dummy data
                searchScore={75} // Dummy data
             />
         )} */}

         {/* Additional Right sidebar content can go here, e.g. "People also viewed" */}
         {/* <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">People you may know</h3>
             <p className="text-sm text-gray-500">Suggestions coming soon...</p>
         </div>
      </div> */}

    </div>
  );
};

export default ProfileHeader;