// // app/components/ProfileHeaderInteractive.tsx
// 'use client';
// import React from 'react';
// import Avatar from './Avatar';
// import ActionButtons from './ActionButtons';

// interface ProfileHeaderInteractiveProps {
//   imgSrc: string;
//   alt: string;
//   userId?: string;
//   isOwnProfile: boolean;
// }

// const ProfileHeaderInteractive = ({ imgSrc, alt, userId, isOwnProfile }: ProfileHeaderInteractiveProps) => {
//   return (
//     <>
//       <Avatar imgSrc={imgSrc} alt={alt} />
//       {userId && <ActionButtons userId={userId} isOwnProfile={isOwnProfile} />}
//     </>
//   );
// };

// export default ProfileHeaderInteractive;