import { Media, NewPost, Post } from "@/src/app/types/feed";
import React, { useState, useRef, useEffect } from "react";
import { PostIntract } from "./PostIntract";
import { formatRelativeDate } from "@/src/utils/formateRelativeDate";
import DeletePostDialog from "./DeletePostModal";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";

interface PostProp {
  post: NewPost;
  onDeletePost?: (postId: string) => void;
}

export default function PostCard({ post, onDeletePost }: PostProp) {

  
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const userid = useSelector((state: RootState) => state.user.user?.id);

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  // Position menu relative to button
  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 8, left: rect.right - 192 }); // 192 = width of menu
    }
  }, [showMenu]);

  console.log(
    "this is the post id which we want to delete =========================================",
    post.id
  );

  return (
    <>
      <article className="bg-white rounded-xl border border-slate-200 shadow-sm transition-transform-shadow duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-lg-hover relative">
        {/* Three-dot menu */}
        <div className="absolute top-4 right-4 z-10">
          <button
            ref={buttonRef}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Post options"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-500"
            >
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="19" cy="12" r="1" fill="currentColor" />
              <circle cx="5" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}${post.user?.avatar}`}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
                aria-label="Author avatar"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-gray-900">
                    @{post.user?.username}
                  </span>
                 
                </div>
                <div className="text-xs text-slate-500">
                  {formatRelativeDate(new Date(post.createdAt))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="mb-0 text-sm text-slate-700 leading-relaxed">
            {post.content}
          </p>
          <PostIntract />
        </div>
      </article>
      {/* Dropdown menu rendered in fixed position */}
      {showMenu && menuPosition && (
        <>
          {/* Click outside to close */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowMenu(false)}
          />

          <div
            className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-[1000]"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {/* Edit post */}

            {post.userId === userid && (
              <button
                onClick={() => setShowMenu(false)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit post
              </button>
            )}

            {/* Save */}
            <button
              onClick={() => setShowMenu(false)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17,21 17,13 7,13 7,21" />
                <polyline points="7,3 7,8 15,8" />
              </svg>
              Save
            </button>

            {/* Copy link */}
            <button
              onClick={() => setShowMenu(false)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-3"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
              </svg>
              Copy link to post
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            {/* Delete post */}
            {post.userId === userid && (
              <button
                onClick={handleDeleteClick}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-3"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                Delete post
              </button>
            )}
          </div>
        </>
      )}
      {post.userId === userid && (
        <DeletePostDialog
          post={post}
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {/* {showDeleteDialog && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#000000aa] bg-opacity-50">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white text-left shadow-xl transition-all">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-600"
                  >
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Delete Post
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this post? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}
