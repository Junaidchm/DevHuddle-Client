
import React from "react";

const SkeletonBox = ({ className = "" }: { className?: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

const ProfileSkeleton: React.FC = () => {
  return (
    <main className="main-content flex-1">
      {/* Title */}
      <SkeletonBox className="h-10 w-1/3 mb-6" />

      {/* Profile Card */}
      <div className="card bg-white rounded-xl shadow-md p-6 mb-8">
        <SkeletonBox className="h-6 w-1/4 mb-6" />

        {/* Avatar & Upload */}
        <div className="flex lg:flex-row flex-col items-start gap-6 mb-6">
          <SkeletonBox className="w-[100px] h-[100px] rounded-full border-4 border-gray-300" />
          <div className="flex flex-col gap-2 w-full lg:w-1/2">
            <SkeletonBox className="h-10 w-1/2" />
            <SkeletonBox className="h-4 w-3/4" />
          </div>
        </div>

        {/* Form Inputs */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="mb-6">
            <SkeletonBox className="h-4 w-1/4 mb-2" />
            <SkeletonBox className="h-10 w-full" />
          </div>
        ))}

        {/* Bio */}
        <div className="mb-0">
          <SkeletonBox className="h-4 w-1/4 mb-2" />
          <SkeletonBox className="h-[120px] w-full" />
        </div>
      </div>

      {/* Skills Card */}
      <div className="card bg-white rounded-xl shadow-md p-6 mb-8">
        <SkeletonBox className="h-6 w-1/4 mb-6" />

        <SkeletonBox className="h-4 w-1/3 mb-2" />
        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBox
              key={i}
              className="h-8 w-[100px] rounded-full"
            />
          ))}
        </div>

        {/* Additional Form Inputs */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-6">
            <SkeletonBox className="h-4 w-1/4 mb-2" />
            <SkeletonBox className="h-10 w-full" />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
        <SkeletonBox className="h-10 w-24" />
        <SkeletonBox className="h-10 w-32" />
      </div>

      {/* Delete Account Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <SkeletonBox className="h-5 w-1/4 mb-3" />
        <SkeletonBox className="h-4 w-2/3 mb-6" />
        <SkeletonBox className="h-10 w-40" />
      </div>
    </main>
  );
};

export default ProfileSkeleton;
