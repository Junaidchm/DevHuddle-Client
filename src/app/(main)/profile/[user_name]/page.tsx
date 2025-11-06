import React from "react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import ProfileHeader from "@/src/components/profile/ProfileHeader";
import FollowersSection from "@/src/components/profile/FollowersSection";
import ProfileNav from "@/src/components/profile/ProfileNav";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { UserProfile } from "@/src/types/user.type";
import "react-hot-toast";
import { fetchProfileByUsernameAction } from "./actions";
import { queryKeys } from "@/src/components/profile/queryKeys";

export default async function ProfilePage({
  params,
}: {
  params: { user_name: string };
}) {
  const session = await auth();
  const { user_name } = await params;
  const currentUserId = session?.user?.id;
  const queryClient = new QueryClient();

  // 1. Prefetch data on the server
  await queryClient.prefetchQuery({
    queryKey: queryKeys.profiles.detail(user_name),
    queryFn: () => fetchProfileByUsernameAction(user_name),
  });

  const profile_user = queryClient.getQueryData<UserProfile | null>(
    queryKeys.profiles.detail(user_name)
  );

  if (!profile_user) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProfileHeader
        username={profile_user.username}
        initialProfile={profile_user}
        currentUserId={currentUserId}
      />
      <main className="max-w-7xl mx-auto my-8 p-0 md:px-6">
        <ProfileNav />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mb-8">
          <div>
            <FollowersSection
              username={profile_user.username}
              currentUserId={currentUserId}
              initialProfile={profile_user}
            />
          </div>
          <div>{/* Right Sidebar */}</div>
        </div>
      </main>
    </HydrationBoundary>
  );
}
