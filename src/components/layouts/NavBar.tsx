"use client";

import { NavLink } from "@/src/app/(main)/profile/update/[username]/components";
import { useUnreadCount } from "@/src/customHooks/useNotifications";
import usePresignedProfileImage from "@/src/customHooks/usePresignedProfileImage";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import UserSearch from "@/src/components/UserSearch";
// WebSocket is now managed at root level via WebSocketProvider
// No need to import or call hook here

export default function NavBar() {
  const { data: session } = useSession();
  const profileImageUrl = usePresignedProfileImage();
  
  
  const { data: unreadData } = useUnreadCount(); 
  const unreadCount = unreadData?.unreadCount || 0;

  console.log("Unread count updated:", unreadCount); // ← ADD THIS

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow sticky top-0 z-[100] px-6 py-3 flex justify-between items-center gap-8">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="logo flex items-center font-bold text-xl text-indigo-600"
        >
          <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            Dev
          </span>
          Huddle
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <NavLink
            href="/community-feed"
            label="Community Feed"
            isActive={true}
          />
          <NavLink href="/domain-hubs" label="Domain Hubs" isActive={false} />
          <NavLink href="/events" label="Events" isActive={false} />
          <NavLink href="/portfolios" label="Portfolios" isActive={false} />
          <NavLink
            href="/submit-project"
            label="Submit Project"
            isActive={false}
          />
        </div>
      </div>

      {session?.user && <UserSearch />}

      <div className="flex items-center gap-4">
        {session?.user ? (
          <>
            <Link href="/notification">
              <button className="relative bg-transparent border-none cursor-pointer text-gray-600 hover:text-indigo-600 transition-colors">
                <i className="fas fa-bell text-xl"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            </Link>
            <Link href={`/profile/${session.user.username}`}>
              <button className="profile-btn flex items-center gap-2 bg-transparent border-none cursor-pointer">
                <img
                  src={profileImageUrl || PROFILE_DEFAULT_URL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-600"
                />
              </button>
            </Link>
          </>
        ) : (
          <Link
            href="/signIn"
            className="no-underline bg-gradient-to-br from-gradient-start to-gradient-end text-black px-4 py-2 rounded-md font-medium text-sm transition-transform-shadow duration-200 ease-in-out shadow-xs hover:-translate-y-0.5 hover:shadow-xl-profile"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
