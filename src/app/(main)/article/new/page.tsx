"use client";

import React from "react";

const ArticlePage = () => {
  return (
    <div className="max-w-6xl mx-auto my-8 px-[5%]">
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-md">
        <div className="flex justify-between items-center">
          <button className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center gap-2">
            <span>Style</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex gap-2">
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">B</button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">I</button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H13V5H3V3ZM3 7H13V9H3V7ZM3 11H13V13H3V11Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H13V5H3V3ZM3 7H13V9H3V7ZM3 11H10V13H3V11Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4H10V6H6V4ZM6 8H10V10H6V8ZM6 12H10V14H6V12Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H13L8 10L3 6Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H12V6H4V4ZM4 8H12V10H4V8ZM4 12H8V14H4V12Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H13L8 13L3 3Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3L13 13" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 3L3 13" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3H13V13H3V3Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L10 10" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 6L6 10" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/150?img=3"
              alt="Your Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-gradient-start"
            />
            <h2 className="text-lg font-semibold text-text-main">Your Name</h2>
            <span className="text-sm text-text-light">Individual article</span>
          </div>
          <div className="flex gap-2">
            <button className="bg-gray-200 text-text-light px-3 py-1 rounded hover:bg-gray-300 text-sm font-medium">Manage</button>
            <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm font-medium">Next</button>
          </div>
        </div>
        <div className="mb-6">
          <div className="relative bg-gray-100 rounded-lg p-6 text-center border-dashed border-2 border-gray-300">
            <img
              src="https://via.placeholder.com/400x200"
              alt="Cover Image"
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <p className="text-text-light text-sm">Add a cover image or video to your article.</p>
            <button className="mt-2 bg-white text-text-main px-4 py-2 rounded border border-slate-200 hover:bg-gray-50 text-sm font-medium flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3L8 13" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M3 8L13 8" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Upload from computer
            </button>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-main mb-2">Title</h3>
          <input
            type="text"
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gradient-start text-sm font-medium"
            placeholder="Enter title here"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-main mb-2">Write here. You can also include @mentions.</h3>
          <textarea
            className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gradient-start min-h-[300px] text-sm font-medium"
            placeholder="Start writing your article..."
          ></textarea>
          <div className="flex justify-end mt-4">
            <button className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 text-sm font-medium">Draft</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;