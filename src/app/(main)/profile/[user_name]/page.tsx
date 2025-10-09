import React from "react";
import ProfileHeader from "@/src/components/profile/ProfileHeader";
import FollowersSection from "@/src/components/profile/FollowersSection";
import "react-hot-toast";
import ProfileNav from "@/src/components/profile/ProfileNav";

export default async function ProfilePage({
  params,
}: {
  params: { user_name: string };
}) {
  

  return (

      <div className="m-0 p-0 font-sans bg-gray-50 text-slate-800">
        <ProfileHeader
          username={'fjldsjdfl'}
          initialProfile={"kdajlfka"}
          currentUserId={'2414124'}
        />
        <main className="max-w-7xl mx-auto my-8 p-0 md:px-6">
          <ProfileNav />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mb-8">
            <div>
              {/* <FollowersSection username={profile_user} currentUserId={userId} /> */}
            </div>
            <div>{/* Right Sidebar */}</div>
          </div>
        </main>
      </div>

  );
}
