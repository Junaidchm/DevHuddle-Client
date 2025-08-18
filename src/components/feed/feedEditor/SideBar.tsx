import { User } from '@/src/app/types/feed';
import React from 'react';

interface SidebarProps {
  user: User;
  contributors: User[];
}

export default function Sidebar({ user, contributors }: SidebarProps) {
  return (
    <aside className="w-[300px] flex-shrink-0">
      <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <img
            src={user.avatar}
            alt={`${user.name}'s Profile`}
            className="w-20 h-20 rounded-full object-cover border-4 border-gradient-start p-0.5 mb-4"
            aria-label="User profile image"
          />
          <h3 className="m-0 mb-1 text-lg font-semibold text-text-main">
            Welcome back!
          </h3>
          <p className="m-0 mb-4 text-sm text-text-light">
            Complete your profile to connect with more developers
          </p>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-3">
            <div className="h-full w-[65%] bg-gradient-to-r from-gradient-start to-gradient-end" />
          </div>
          <p className="m-0 mb-5 text-xs text-text-light">
            Profile strength: <strong>65%</strong>
          </p>
          <button
            className="w-full bg-gradient-to-br from-gradient-start to-gradient-end text-white border-none py-3 rounded-md font-semibold text-sm cursor-pointer transition-transform-shadow duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl-profile"
            aria-label="Complete your profile"
          >
            Complete Your Profile
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
        <h3 className="m-0 mb-4 text-lg font-semibold text-text-main flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="#8b5cf6"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Top Contributors
        </h3>
        <div className="flex flex-col gap-4">
          {contributors.map((contributor, index) => (
            <div key={contributor.id} className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={contributor.avatar}
                  alt={`${contributor.name}'s Avatar`}
                  className="w-[42px] h-[42px] rounded-full object-cover"
                  aria-label="Contributor avatar"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-success rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-white text-[0.5rem]">{index + 1}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-text-main">
                    {contributor.name}
                  </span>
                  <span className="text-xs text-text-light">{contributor.points} pts</span>
                </div>
                <div className="text-xs text-text-light flex items-center gap-1">
                  <span>{contributor.title}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-gradient-start">Follow</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <a
          href="#"
          className="block text-center text-gradient-start text-sm font-medium mt-4 py-2 px-4 rounded-md transition-colors duration-200 ease-in-out hover:bg-[rgba(59,130,246,0.05)]"
          aria-label="View all contributors"
        >
          View All Contributors
        </a>
      </div>
    </aside>
  );
}