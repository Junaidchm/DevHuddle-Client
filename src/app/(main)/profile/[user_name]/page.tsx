import React from "react";
import ProfileHeader from "@/src/components/profile/ProfileHeader";
import FollowersSection from "@/src/components/profile/FollowersSection";
import ProfileNav from "@/src/components/profile/ProfileNav";
import { auth } from "@/auth";
import { fetchProfileByUsername } from "@/src/services/api/profile.service";
import { notFound } from "next/navigation";
import "react-hot-toast";

export default async function ProfilePage({
  params,
}: {
  params: { user_name: string };
}) {
  const session = await auth();
  const { user_name } = await params;
  const profile_user = await fetchProfileByUsername(user_name, session?.user?.accessToken ? { Authorization: `Bearer ${session.user.accessToken}` } : undefined);

  if (!profile_user) {
    notFound();
  }

  const currentUserId = session?.user?.id;

  return (
    <div className="m-0 p-0 font-sans bg-gray-50 text-slate-800">
      <ProfileHeader
        username={profile_user.username}
        initialProfile={profile_user}
        currentUserId={currentUserId}
      />
      <main className="max-w-7xl mx-auto my-8 p-0 md:px-6">
        <ProfileNav />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mb-8">
          <div>
            <FollowersSection username={profile_user.username} currentUserId={currentUserId} initialProfile={profile_user} />
          </div>
          <div>{/* Right Sidebar */}</div>
        </div>
      </main>
    </div>
  );
}
