// app/components/Pagination.tsx
'use client';
import React from 'react';

const Pagination = () => {
  return (
    <div className="flex justify-center gap-2 mb-8">
      <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button className="w-10 h-10 flex items-center justify-center bg-blue-500 border border-blue-500 rounded-md text-white font-medium">1</button>
      <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 font-medium">2</button>
      <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 font-medium">3</button>
      <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500">...</button>
      <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500 font-medium">42</button>
      <button className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default Pagination;