// app/components/FollowerItem.tsx
'use client';
import React from 'react';

interface FollowerProps {
  imgSrc: string;
  name: string;
  username: string;
  role: string;
  alt: string;
}

const FollowerItem = ({ imgSrc, name, username, role, alt }: FollowerProps) => {
  return (
    <div className="p-5 border-b border-slate-100 last:border-b-0 flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img src={imgSrc} alt={alt} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="font-semibold text-slate-800 mb-1">{name}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">{username}</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-sm text-slate-500">{role}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="bg-white border border-slate-200 text-blue-500 py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
          Message
        </button>
        <button className="bg-blue-500 border border-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600">
          Follow Back
        </button>
      </div>
    </div>
  );
};

export default FollowerItem;