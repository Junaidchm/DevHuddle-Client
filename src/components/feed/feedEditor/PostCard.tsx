
import { Post } from '@/src/app/types/feed';
import React from 'react';
import { PostIntract } from './PostIntract';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-transform-shadow duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg-hover">
      <div className="p-4 flex items-center gap-3 border-b border-slate-100">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <img
              src={post.author.avatar}
              alt={`${post.author.name}'s Avatar`}
              className="w-8 h-8 rounded-full object-cover"
              aria-label="Author avatar"
            />
            <span className="font-bold text-base text-gray-900">{post.author.name}</span>
            <span className="text-xs text-gray-custom">@{post.author.name.toLowerCase().replace(' ', '')}</span>
          </div>
          <div className="text-xs text-gray-custom mt-1">
            Posted on {post.platform} • {new Date(post.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="mb-0 text-sm text-slate-700 leading-relaxed">{post.content}</p>
        {post.mediaUrl && (
          <img
            src={post.mediaUrl}
            alt="Post media"
            className="w-full rounded-md mt-4"
            aria-label="Post media content"
          />
        )}
        {/* <div className="bg-gray-100 rounded-md p-4 mb-1 border border-slate-200 overflow-x-auto">
          hello
          hello
        </div> */}
        <a
          href="#"
          className="block no-underline border border-slate-200 rounded-md mb-4"
          aria-label="Link to React Awesome UI Components"
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
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-indigo-opacity text-gradient-start rounded-full text-xs font-medium"
              aria-label={`Tag: ${tag}`}
            >
              {tag}
            </span>
          ))}
        </div>

        <PostIntract/>
      </div>
    </article>
  );
}