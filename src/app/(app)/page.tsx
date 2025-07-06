"use client";

import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";

const CommunityFeed: React.FC = () => {
 
  return (
    <div>
      
      <div className="max-w-6xl mx-auto my-8 px-[5%] flex gap-8 flex-wrap">
        <main className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="m-0 text-3xl font-bold text-text-main">
                Community Feed
              </h1>
              <p className="mt-2 mb-0 text-text-light text-sm">
                Connect with developers across platforms
              </p>
            </div>
            <button className="bg-gradient-to-br from-gradient-start to-gradient-end text-white border-none px-5 py-3 rounded-lg font-semibold flex items-center gap-2 cursor-pointer transition-transform-shadow duration-200 ease-in-out shadow-md hover:-translate-y-0.5 hover:shadow-xl-gradient">
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Post
            </button>
          </div>
        
          <div className="flex flex-col gap-4">
            <article className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-transform-shadow duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg-hover">
              <div className="p-4 flex items-center gap-3 border-b border-slate-100">
                <div className="w-6 h-6 bg-discord rounded-md flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://i.pravatar.cc/150?img=33"
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-bold text-base text-gray-900">
                      Sarah Dev
                    </span>
                    <span className="text-xs text-gray-custom">@sarahdev</span>
                  </div>
                  <div className="text-xs text-gray-custom mt-1">
                    Posted on Discord • 2 days ago
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="mb-0 text-sm text Slate-700 leading-relaxed">
                  Just launched my new React component library! It&apos;s
                  designed for maximum flexibility and performance. Check out
                  the documentation and examples:
                </p>
                <div className="bg-gray-100 rounded-md p-4 mb-1 border border-slate-200 overflow-x-auto">
                  <code className="font-mono text-sm text-slate-700">
                    import &#123; Button &#125; from &apos;awesome-ui&apos;;
                    <br />
                    <br />
                    function App() &#123;
                    <br />
                    &nbsp;&nbsp;return (<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;Button
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;variant=&quot;gradient&quot;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;size=&quot;lg&quot;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;onClick=&#123;() =&gt;
                    console.log(&apos;Clicked!&apos;)&#125;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&gt;
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get Started
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;&lt;/Button&gt;
                    <br />
                    &nbsp;&nbsp;);
                    <br />
                    &#125;
                  </code>
                </div>
                <a
                  href="#"
                  className="block no-underline border border-slate-200 rounded-md mb-4"
                >
                  <div className="bg-gray-200 p-3 flex gap-2 items-center">
                    <div className="w-[60px] h-[60px] bg-gradient-to-br from-gradient-start to-gradient-end rounded flex items-center justify-center flex-shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        stroke="white"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="16 18 22 12 16 6" />
                        <polyline points="8 6 2 12 8 18" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900 mb-1">
                        React Awesome UI Components
                      </div>
                      <div className="text-xs text-gray-700">
                        github.com/sarahdev/react-awesome-ui
                      </div>
                    </div>
                  </div>
                </a>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="px-3 py-1 bg-indigo-opacity text-gradient-start rounded-full text-xs font-medium">
                    #react
                  </span>
                  <span className="px-3 py-1 bg-purple-opacity text-gradient-end rounded-full text-xs font-medium">
                    #frontend
                  </span>
                  <span className="px-3 py-1 bg-emerald-opacity text-success rounded-full text-xs font-medium">
                    #opensource
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="flex gap-6">
                    <button className="bg-transparent border-none flex items-center gap-1.5 text-sm text-text-light cursor-pointer px-2 py-1 rounded transition-colors duration-200 ease-in-out hover:bg-gray-200 hover:text-gradient-start">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      42
                    </button>
                    <button className="bg-transparent border-none flex items-center gap-1.5 text-sm text-text-light cursor-pointer px-2 py-1 rounded transition-colors duration-200 ease-in-out hover:bg-gray-200 hover:text-gradient-start">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      18
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-transparent border-none p-1 text-text-light cursor-pointer transition-colors duration-200 ease-in-out rounded hover:text-gradient-start">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                    <button className="bg-transparent border-none p-1 text-text-light cursor-pointer transition-colors duration-200 ease-in-out rounded hover:text-gradient-start">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>
                    <button className="bg-transparent border-none p-1 text-text-light cursor-pointer transition-colors duration-200 ease-in-out rounded hover:text-gradient-start">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </main>
        <aside className="w-[300px] flex-shrink-0">
          <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <img
                src="https://i.pravatar.cc/150?img=3"
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-gradient-start p-0.5 mb-4"
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
              <button className="w-full bg-gradient-to-br from-gradient-start to-gradient-end text-white border-none py-3 rounded-md font-semibold text-sm cursor-pointer transition-transform-shadow duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl-profile">
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
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/150?img=33"
                    alt="User"
                    className="w-[42px] h-[42px] rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-success rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-[0.5rem]">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-text-main">
                      Sarah Dev
                    </span>
                    <span className="text-xs text-text-light">14.2k pts</span>
                  </div>
                  <div className="text-xs text-text-light flex items-center gap-1">
                    <span>Frontend Developer</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-gradient-start">Follow</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/150?img=68"
                    alt="User"
                    className="w-[42px] h-[42px] rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-gradient-end rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-[0.5rem]">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-text-main">
                      Alex Coder
                    </span>
                    <span className="text-xs text-text-light">12.8k pts</span>
                  </div>
                  <div className="text-xs text-text-light flex items-center gap-1">
                    <span>Data Scientist</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-gradient-start">Follow</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://i.pravatar.cc/150?img=42"
                    alt="User"
                    className="w-[42px] h-[42px] rounded-full object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-amber-custom rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-[0.5rem]">3</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm text-text-main">
                      Jamie Backend
                    </span>
                    <span className="text-xs text-text-light">11.5k pts</span>
                  </div>
                  <div className="text-xs text-text-light flex items-center gap-1">
                    <span>Backend Engineer</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-gradient-start">Follow</span>
                  </div>
                </div>
              </div>
            </div>
            <a
              href="#"
              className="block text-center text-gradient-start text-sm font-medium mt-4 py-2 px-4 rounded-md transition-colors duration-200 ease-in-out hover:bg-[rgba(59,130,246,0.05)]"
            >
              View All Contributors
            </a>
          </div>
        </aside>
      </div>
      <div className="modal-backdrop fixed inset-0 bg-black/50 z-[1000] opacity-0 hidden">
        <div className="modal fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-95 w-[95%] max-w-[600px] bg-card-bg rounded-xl shadow-lg opacity-0 hidden sm:scale-100 max-w-[600px]:w-full max-w-[600px]:bottom-0 max-w-[600px]:top-auto max-w-[600px]:left-0 max-w-[600px]:right-0 max-w-[600px]:translate-y-full max-w-[600px]:rounded-t-xl max-w-[600px]:rounded-b-none">
          <div className="modal-content flex flex-col">
            <div className="modal-header flex justify-between items-center p-4 px-6 border-b border-border-color">
              <h3 className="text-xl font-semibold text-text-main m-0">
                Create Post
              </h3>
              <button className="close-button w-8 h-8 rounded-full flex items-center justify-center bg-transparent border-none cursor-pointer text-text-light hover:bg-light-bg">
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body p-6 max-h-[calc(80vh-120px)] overflow-y-auto">
              <div className="form-group mb-4">
                <label
                  htmlFor="platform"
                  className="block font-medium mb-2 text-text-main"
                >
                  Select Platform
                </label>
                <div className="platform-select-wrapper relative">
                  <select
                    id="platform-selector"
                    className="platform w-full pl-10 pr-4 py-3 border border-border-color rounded-md bg-card-bg text-text-main text-base appearance-none cursor-pointer"
                  >
                    <option value="discord">Discord</option>
                    <option value="stackoverflow">Stack Overflow</option>
                    <option value="reddit">Reddit</option>
                    <option value="slack">Slack</option>
                  </select>
                  <i className="platform-icon fas fa-globe absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                </div>
              </div>
              <div className="form-group mb-4">
                <label
                  htmlFor="post-content"
                  className="block font-medium mb-2 text-text-main"
                >
                  Your Post
                </label>
                <textarea
                  id="post-content"
                  className="post-content w-full min-h-[120px] p-3 border border-border-color rounded-lg text-base font-['inherit'] resize-y focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="What's on your mind?"
                />
              </div>
              <div className="form-group mb-4">
                <label className="block font-medium mb-2 text-text-main">
                  Add Media
                </label>
                <div className="drop-area border-2 border-dashed border-border-color rounded-md p-6 text-center cursor-pointer transition-colors duration-200 ease-in-out hover:border-gray-400">
                  <div className="drop-message text-text-light">
                    <i className="fas fa-upload text-2xl mb-2 block" />
                    Drag and drop files here or click to upload
                  </div>
                  <div className="file-preview flex flex-wrap gap-2 mt-4" />
                </div>
              </div>
              <div className="form-group mb-4">
                <label
                  htmlFor="tags"
                  className="block font-medium mb-2 text-text-main"
                >
                  Tags
                </label>
                <div className="tags-input-container flex flex-wrap items-center w-full p-2 border border-border-color rounded-md bg-card-bg">
                  <div className="tags-container flex flex-wrap gap-2">
                    {/* Tags will be added dynamically */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
