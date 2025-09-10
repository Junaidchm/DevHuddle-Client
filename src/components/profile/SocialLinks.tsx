// app/components/SocialLinks.tsx
'use client';
import React from 'react';
import SocialLink from './SocialLink';

interface SocialLinksProps {
  links: { href: string; icon: string; title: string }[];
}

const SocialLinks = ({ links }: SocialLinksProps) => {
  return (
    <div className="flex gap-4">
      {links.map((link, index) => (
        <SocialLink key={index} href={link.href} icon={link.icon} title={link.title} />
      ))}
    </div>
  );
};

export default SocialLinks;