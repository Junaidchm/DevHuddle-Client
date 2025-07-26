"use client";

import React from "react";

const Profile: React.FC = () => {
  return (
     <div className="m-0 p-0 font-inter bg-gray-50 text-gray-900">
        {/* Profile Header Section */}
       
        {/* Main Content */}
        <main className="max-w-5xl mx-auto my-8 px-6">
          {/* Main Content Section with Grid Layout */}
          <div className="grid grid-cols-[1fr_280px] gap-6 mb-8">
            {/* Left Column - Content */}
            <div>
              {/* Followers Section */}
              <section id="followers" className="block">
                {/* Followers Header */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="m-0 text-xl font-semibold text-gray-900">
                      Network
                    </h2>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">View:</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button className="bg-blue-500 text-white border-none py-1.5 px-3 rounded-md text-sm font-medium cursor-pointer">
                            Followers
                          </button>
                          <button className="bg-transparent text-gray-500 border-none py-1.5 px-3 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-200">
                            Following
                          </button>
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search network..."
                          className="bg-white border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm text-gray-900 w-[200px] outline-none focus:border-blue-500"
                        />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="absolute left-3 top-1/2 -translate-y-1/2"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Network Stats */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 mb-8">
                  {/* Stat Card 1 */}
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 mb-2">
                          Total Followers
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          843
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <polyline points="17 11 19 13 23 9"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      <span className="text-green-600 font-medium">+24</span>{" "}
                      new followers this month
                    </div>
                  </div>
                  {/* Stat Card 2 */}
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 mb-2">
                          Following
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          128
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="18" y1="8" x2="23" y2="13"></line>
                          <line x1="23" y1="8" x2="18" y2="13"></line>
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      <span className="text-green-600 font-medium">+7</span> new
                      following this month
                    </div>
                  </div>
                  {/* Stat Card 3 */}
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm text-gray-500 mb-2">
                          Top Domain
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          Frontend
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      <span className="text-green-600 font-medium">65%</span> of
                      your network connections
                    </div>
                  </div>
                </div>
                {/* Follower List */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
                  {/* Follower 1 */}
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src="https://randomuser.me/api/portraits/women/44.jpg"
                          alt="Sarah Johnson"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          Sarah Johnson
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">@sarahj</span>
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-sm text-gray-500">
                            UI/UX Designer
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-white border border-gray-200 text-blue-500 py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
                        Message
                      </button>
                      <button className="bg-blue-500 border border-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600">
                        Follow Back
                      </button>
                    </div>
                  </div>
                  {/* Follower 2 */}
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src="https://randomuser.me/api/portraits/men/85.jpg"
                          alt="Michael Chen"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          Michael Chen
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            @michael_c
                          </span>
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-sm text-gray-500">
                            Backend Developer
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-white border border-gray-200 text-blue-500 py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
                        Message
                      </button>
                      <button className="bg-blue-500 border border-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600">
                        Follow Back
                      </button>
                    </div>
                  </div>
                  {/* Follower 3 */}
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src="https://randomuser.me/api/portraits/women/63.jpg"
                          alt="Jessica Patel"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          Jessica Patel
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            @jessicap
                          </span>
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-sm text-gray-500">
                            Data Scientist
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-white border border-gray-200 text-blue-500 py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
                        Message
                      </button>
                      <button className="bg-blue-500 border border-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600">
                        Follow Back
                      </button>
                    </div>
                  </div>
                  {/* Follower 4 */}
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src="https://randomuser.me/api/portraits/men/54.jpg"
                          alt="David Wilson"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          David Wilson
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">@davidw</span>
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-sm text-gray-500">
                            DevOps Engineer
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-white border border-gray-200 text-blue-500 py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
                        Message
                      </button>
                      <button className="bg-blue-500 border border-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600">
                        Follow Back
                      </button>
                    </div>
                  </div>
                  {/* Follower 5 */}
                  <div className="p-5 flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        <img
                          src="https://randomuser.me/api/portraits/women/29.jpg"
                          alt="Emily Rodriguez"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          Emily Rodriguez
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">@emilyr</span>
                          <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                          <span className="text-sm text-gray-500">
                            Product Manager
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-white border border-gray-200 text-blue-500 py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
                        Message
                      </button>
                      <button className="bg-blue-500 border border-blue-500 text-white py-2 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600">
                        Follow Back
                      </button>
                    </div>
                  </div>
                </div>
                {/* Pagination */}
                <div className="flex justify-center gap-2 mb-8">
                  <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-blue-500 border border-blue-500 rounded-md text-white font-medium">
                    1
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-500 font-medium">
                    2
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-500 font-medium">
                    3
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-500">
                    ...
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-500 font-medium">
                    42
                  </button>
                  <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </section>
              {/* Ideas Section */}
              <section id="ideas" className="hidden">
                {/* Ideas Header */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="m-0 text-xl font-semibold text-gray-900">
                      My Ideas
                    </h2>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Filter by:
                        </span>
                      </div>
                      <button className="flex items-center gap-2 bg-blue-500 text-white border-none py-2 px-4 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Submit New Idea
                      </button>
                    </div>
                  </div>
                </div>
                {/* Ideas List */}
                <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
                  {/* Idea 1 */}
                  <div className="p-5 border-b border-gray-100 flex gap-4 items-start">
                    <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ec4899"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h4 className="m-0 text-base font-semibold text-gray-900">
                          GitCollab - Enhanced Code Reviews
                        </h4>
                        <div className="text-sm text-gray-500">3 days ago</div>
                      </div>
                      <p className="m-0 mb-3 text-sm text-gray-500">
                        A platform that integrates with GitHub to provide
                        AI-assisted code reviews, highlighting potential bugs,
                        security issues, and suggesting optimizations.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          GitHub Integration
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          AI
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          Code Review
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 text-blue-500 text-xs font-medium py-1 px-2 rounded flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          In Review
                        </div>
                        <a
                          href="submit-idea.html"
                          className="text-sm text-blue-500 no-underline flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                          View Idea
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Idea 2 */}
                  <div className="p-5 border-b border-gray-100 flex gap-4 items-start">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h4 className="m-0 text-base font-semibold text-gray-900">
                          DevMentor - AI Programming Assistant
                        </h4>
                        <div className="text-sm text-gray-500">1 week ago</div>
                      </div>
                      <p className="m-0 mb-3 text-sm text-gray-500">
                        An AI-powered programming assistant that helps
                        developers learn new technologies by providing
                        context-aware suggestions, examples, and explanations
                        directly in their IDE.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          Machine Learning
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          VSCode Extension
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          Education
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-green-50 text-green-600 text-xs font-medium py-1 px-2 rounded flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Approved
                        </div>
                        <a
                          href="submit-idea.html"
                          className="text-sm text-blue-500 no-underline flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                          View Idea
                        </a>
                      </div>
                    </div>
                  </div>
                  {/* Idea 3 */}
                  <div className="p-5 flex gap-4 items-start">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <h4 className="m-0 text-base font-semibold text-gray-900">
                          CloudPulse - Serverless Monitoring
                        </h4>
                        <div className="text-sm text-gray-500">2 weeks ago</div>
                      </div>
                      <p className="m-0 mb-3 text-sm text-gray-500">
                        A serverless monitoring solution that provides real-time
                        insights into function performance, cold starts, and
                        cost optimization opportunities across multiple cloud
                        providers.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          Serverless
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          AWS
                        </span>
                        <span className="bg-gray-100 text-gray-500 text-xs py-1 px-2 rounded">
                          Monitoring
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-red-50 text-red-500 text-xs font-medium py-1 px-2 rounded flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            ></rect>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                          </svg>
                          Needs Revision
                        </div>
                        <a
                          href="submit-idea.html"
                          className="text-sm text-blue-500 no-underline flex items-center gap-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                          View Idea
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Load More Button */}
                <div className="flex justify-center mb-8">
                  <button className="bg-white border border-gray-200 text-gray-500 py-3 px-6 rounded-lg flex items-center gap-2 font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <polyline points="23 20 23 14 17 14"></polyline>
                      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>
                    Load More Ideas
                  </button>
                </div>
              </section>
            </div>
            {/* Right Sidebar */}
            <div>
              {/* Profile Completion Card */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-6">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="m-0 text-[0.938rem] font-semibold text-gray-900">
                    Profile Completion
                  </h3>
                </div>
                <div className="p-5">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-gray-500">85% Complete</span>
                    <span className="text-sm font-medium text-blue-500">
                      5/6 Steps
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded overflow-hidden mb-5">
                    <div className="h-full w-[85%] bg-gradient-to-r from-blue-500 to-purple-500 rounded">
                    
                    </div>
                  </div>
                  <div className="text-[0.813rem] text-gray-500 mb-4">
                    Complete your profile to increase visibility and
                    opportunities.
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        Profile Picture
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        Bio Information
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        Skills & Expertise
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        Social Connections
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">
                        Portfolio Items
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-400">
                        Professional Certifications
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};

export default Profile;
