
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
        <div className="w-6 h-6 bg-discord rounded-md flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        </div>
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
        <div className="bg-gray-100 rounded-md p-4 mb-1 border border-slate-200 overflow-x-auto">
          <code className="font-mono text-sm text-slate-700">
            {/* import {'{'} Button {'}'} from 'awesome-ui';<br />
            <br />
            function App() {'{'}
            <br />
              return (<br />
                <Button<br />
                  variant="gradient"<br />
                  size="lg"<br />
                  onClick={'{'}() => console.log('Clicked!'){'}'}
            <br />
                >
            <br />
                  Get Started
            <br />
                </Button>
            <br />
              );
            <br />
            {'}'} */}
          </code>
        </div>
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
        {/* <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="flex gap-6">
            <button
              className="bg-transparent border-none flex items-center gap-1.5 text-sm text-text-light cursor-pointer px-2 py-1 rounded transition-colors duration-200 ease-in-out hover:bg-gray-200 hover:text-gradient-start"
              aria-label={`Like post, ${post.likes} likes`}
            >
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
              {post.likes}
            </button>
            <button
              className="bg-transparent border-none flex items-center gap-1.5 text-sm text-text-light cursor-pointer px-2 py-1 rounded transition-colors duration-200 ease-in-out hover:bg-gray-200 hover:text-gradient-start"
              aria-label={`Comment on post, ${post.comments} comments`}
            >
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
              {post.comments}
            </button>
          </div>
          <div className="flex gap-3">
            <button
              className="bg-transparent border-none p-1 text-text-light cursor-pointer transition-colors duration-200 ease-in-out rounded hover:text-gradient-start"
              aria-label="Share post"
            >
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
            <button
              className="bg-transparent border-none p-1 text-text-light cursor-pointer transition-colors duration-200 ease-in-out rounded hover:text-gradient-start"
              aria-label="Edit post"
            >
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
            <button
              className="bg-transparent border-none p-1 text-text-light cursor-pointer transition-colors duration-200 ease-in-out rounded hover:text-gradient-start"
              aria-label="More options"
            >
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
        </div> */}

        <PostIntract/>
      </div>
    </article>
  );
}