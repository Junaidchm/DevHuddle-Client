"use client";

import { NavLink } from "@/src/app/(main)/profile/update/[username]/components";
import { useUnreadCount } from "@/src/customHooks/useNotifications";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import UserSearch from "@/src/components/UserSearch";
import { useState, useEffect } from "react";
// WebSocket is now managed at root level via WebSocketProvider
// No need to import or call hook here

export default function NavBar() {
  const { data: session } = useSession();
  const profileImageUrl = session?.user?.image;
  const [avatarSrc, setAvatarSrc] = useState(PROFILE_DEFAULT_URL);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (profileImageUrl) {
      setAvatarSrc(profileImageUrl);
    }
  }, [profileImageUrl]);
  
  const { data: unreadData } = useUnreadCount(); 
  const unreadCount = unreadData?.unreadCount || 0;

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow sticky top-0 z-[100] px-4 sm:px-6 py-3">
      <div className="flex justify-between items-center gap-4 sm:gap-8">
        {/* Logo and Desktop Nav */}
        <div className="flex items-center gap-4 sm:gap-8 flex-1">
          <Link
            href="/"
            className="logo flex items-center font-bold text-lg sm:text-xl text-indigo-600 flex-shrink-0"
          >
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Dev
            </span>
            Huddle
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-4 xl:gap-6 items-center">
            <NavLink
              href="/community-feed"
              label="Community Feed"
              isActive={true}
            />
            <NavLink href="/projects" label="Projects" isActive={false} />
            <NavLink href="/domain-hubs" label="Domain Hubs" isActive={false} />
            <NavLink href="/events" label="Events" isActive={false} />
            <NavLink href="/portfolios" label="Portfolios" isActive={false} />
            <NavLink
              href="/projects/create"
              label="Submit Project"
              isActive={false}
            />
          </div>
        </div>

        {/* Search - Hidden on small screens */}
        <div className="hidden md:block flex-shrink-0">
          {session?.user && <UserSearch />}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {session?.user && (
            <>
              <Link href="/notification" className="flex-shrink-0">
                <button className="relative bg-transparent border-none cursor-pointer text-gray-600 hover:text-indigo-600 transition-colors p-2">
                  <i className="fas fa-bell text-lg sm:text-xl"></i>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </Link>
              <Link href={`/profile/${session.user.username}`} className="flex-shrink-0">
                <button className="profile-btn flex items-center gap-2 bg-transparent border-none cursor-pointer">
                  <img
                    src={avatarSrc}
                    alt="Profile"
                     onError={() => setAvatarSrc(PROFILE_DEFAULT_URL)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-indigo-600"
                  />
                </button>
              </Link>
            </>
          )}
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
          {/* Mobile Search */}
          {session?.user && (
            <div className="mb-4 md:hidden">
              <UserSearch />
            </div>
          )}
          
          {/* Mobile Navigation Links */}
          <div className="flex flex-col gap-2">
            <NavLink
              href="/community-feed"
              label="Community Feed"
              isActive={true}
            />
            <NavLink href="/projects" label="Projects" isActive={false} />
            <NavLink href="/domain-hubs" label="Domain Hubs" isActive={false} />
            <NavLink href="/events" label="Events" isActive={false} />
            <NavLink href="/portfolios" label="Portfolios" isActive={false} />
            <NavLink
              href="/projects/create"
              label="Submit Project"
              isActive={false}
            />
          </div>
        </div>
      )}
    </nav>
  );
}