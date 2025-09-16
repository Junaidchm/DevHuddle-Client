import React from "react";
import { cookies, headers } from "next/headers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import ProfileHeader from "@/src/components/profile/ProfileHeader";
import FollowersSection from "@/src/components/profile/FollowersSection";
import "react-hot-toast";
import { fetchProfile } from "@/src/services/api/profile.service";
import ProfileNav from "@/src/components/profile/ProfileNav";
import axios from "axios";

export default async function ProfilePage({
  params,
}: {
  params: { user_name: string };
}) {
  const queryClient = new QueryClient();
  const profile_user = params.user_name;

  const profile = await queryClient.fetchQuery({
    queryKey: ["profile", profile_user],
    queryFn: () => fetchProfile(profile_user),
  });

  const dehydratedState = dehydrate(queryClient);

  const userId = (await headers()).get("x-user-id") as string;
  const username = (await headers()).get("x-username") as string;

  return (
    <HydrationBoundary state={dehydratedState}>
      <div className="m-0 p-0 font-sans bg-gray-50 text-slate-800">
        <ProfileHeader
          username={profile_user}
          initialProfile={profile}
          currentUserId={userId}
        />
        <main className="max-w-7xl mx-auto my-8 p-0 md:px-6">
          <ProfileNav />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mb-8">
            <div>
              <FollowersSection username={profile_user} currentUserId={userId} />
            </div>
            <div>{/* Right Sidebar */}</div>
          </div>
        </main>
      </div>
    </HydrationBoundary>
  );
}
