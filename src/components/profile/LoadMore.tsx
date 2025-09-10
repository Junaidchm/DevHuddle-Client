// app/components/LoadMoreIdeas.tsx
'use client';
import React from 'react';

const LoadMoreIdeas = () => {
  return (
    <div className="flex justify-center mb-8">
      <button className="bg-white border border-slate-200 text-slate-500 py-3 px-6 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10"></polyline>
          <polyline points="23 20 23 14 17 14"></polyline>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
        Load More Ideas
      </button>
    </div>
  );
};

export default LoadMoreIdeas;