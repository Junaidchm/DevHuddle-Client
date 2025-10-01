"use client"

import { NavLink } from "@/src/app/(main)/profile/update/[username]/components";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import usePresignedProfileImage from "@/src/customHooks/usePresignedProfileImage";
import { RootState } from "@/src/store/store";
import { getSession, useSession } from "next-auth/react";
import Link from "next/link";
import { useSelector } from "react-redux";

export default function NavBar() {

    const { data: session } = useSession()
    const profileImageUrl = usePresignedProfileImage()

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow sticky top-0 z-[100] px-6 py-3 flex justify-between items-center">
        <div className="logo flex items-center font-bold text-xl text-indigo-600">
          <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            Dev
          </span>
          Huddle
        </div>
        <div className="nav-links flex gap-6 items-center">
          <NavLink
            href="community-feed.html"
            label="Community Feed"
            isActive={true}
          />
          <NavLink
            href="domain-hubs.html"
            label="Domain Hubs"
            isActive={false}
          />
          <NavLink
            href="events-hackathons.html"
            label="Events"
            isActive={false}
          />
          <NavLink href="portfolios.html" label="Portfolios" isActive={false} />
          <NavLink
            href="submit-project.html"
            label="Submit Project"
            isActive={false}
          />
        </div>
        {session?.user ? (
          <Link href={`/profile/update/${session.user.username}`}>
            <button className="profile-btn flex items-center gap-2 bg-transparent border-none cursor-pointer">
              <img
                src={profileImageUrl}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-indigo-600"
              />
            </button>
          </Link>
        ) : (
          <Link
            href="/signIn"
            className="no-underline bg-gradient-to-br from-gradient-start to-gradient-end text-black px-4 py-2 rounded-md font-medium text-sm transition-transform-shadow duration-200 ease-in-out shadow-xs hover:-translate-y-0.5 hover:shadow-xl-profile"
          >
            Log In
          </Link>
        )}
      </nav>
    )
}