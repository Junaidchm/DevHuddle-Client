// app/components/SocialLink.tsx
'use client';
import React from 'react';

const SocialLink = ({ href, icon, title }: { href: string; icon: string; title: string }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-10 h-10 bg-gray-50 rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-200 hover:text-blue-500"
      title={title}
    >
      <i className={`fa-brands ${icon} fa-lg`}></i>
    </a>
  );
};

export default SocialLink;
