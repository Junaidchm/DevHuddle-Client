"use client";

import { useUnreadCount } from "@/src/customHooks/useNotifications";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import UserSearch from "@/src/components/UserSearch";
import { useState, useEffect } from "react";
import { 
  Home, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  User, 
  Menu,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  count?: number;
}

const NavLink = ({ href, icon, label, isActive, count }: NavLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-1 min-w-[70px] relative group transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="relative">
        <div className={cn("transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")}>
           {icon}
        </div>
        {count ? (
          <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-in zoom-in">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] sm:text-xs mt-1 font-medium hidden md:block">{label}</span>
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-full" />
      )}
    </Link>
  );
};

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
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
    <nav className="bg-white border-b border-border sticky top-0 z-[100]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[52px] md:h-14 flex items-center justify-between gap-4">
        {/* Logo and Search */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex-shrink-0"
          >
            <div className="bg-primary text-primary-foreground font-bold text-xl rounded p-1 w-8 h-8 flex items-center justify-center tracking-tighter">
              DH
            </div>
          </Link>
          
          <div className="hidden md:block w-[240px]">
             {session?.user && <UserSearch />}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-1 sm:gap-6 flex-1 justify-end md:justify-center">
            <NavLink
              href="/"
              label="Home"
              icon={<Home className="w-5 h-5 sm:w-6 sm:h-6" />}
              isActive={pathname === "/"}
            />
            <NavLink 
              href="/projects" 
              label="Projects" 
              icon={<Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />}
              isActive={pathname.startsWith("/projects")} 
            />
            <NavLink 
              href="/chat" 
              label="Messaging" 
              icon={<MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />}
              isActive={pathname.startsWith("/chat")} 
            /> 
             <NavLink
               href="/notification"
               label="Notifications"
               icon={<Bell className="w-5 h-5 sm:w-6 sm:h-6" />}
               isActive={pathname === "/notification"}
               count={unreadCount}
             />
             
             {/* Profile Dropdown Logic - simplified for now */}
             <div className="hidden md:flex flex-col items-center justify-center px-2 cursor-pointer group relative">
                <Link href={session?.user?.username ? `/profile/${session.user.username}` : "#"} className="flex flex-col items-center">
                    <img
                        src={avatarSrc}
                        alt="Profile"
                        onError={() => setAvatarSrc(PROFILE_DEFAULT_URL)}
                        className="w-6 h-6 rounded-full object-cover border border-border"
                    />
                    <span className="text-[10px] sm:text-xs mt-1 text-muted-foreground font-medium group-hover:text-foreground flex items-center gap-0.5">
                        Me <MoreHorizontal className="w-3 h-3" />
                    </span>
                 </Link>
             </div>
        </div>

        {/* Mobile Search - Visible only on mobile */}
        <div className="md:hidden flex-1 max-w-[200px]">
            {session?.user && <UserSearch />}
        </div>
        
        {/* Mobile Menu Toggle */}
         <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <Menu className="w-6 h-6" />
            </Button>
         </div>

      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white p-4 absolute w-full shadow-lg">
           <div className="flex flex-col gap-4">
                <Link href={session?.user?.username ? `/profile/${session.user.username}` : "#"} className="flex items-center gap-3 p-2 hover:bg-muted rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                    <img
                        src={avatarSrc}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                     <div className="flex flex-col">
                        <span className="font-semibold">{session?.user?.name}</span>
                        <span className="text-sm text-muted-foreground">View Profile</span>
                     </div>
                </Link>
                {/* Add other mobile links here if needed */}
           </div>
        </div>
      )}
    </nav>
  );
}