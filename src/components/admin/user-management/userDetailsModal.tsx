"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import { useApiClient } from "@/src/lib/api-client";
import { fetchUserFullDetails } from "@/src/services/api/admin.service";

interface UserDetailsModalProps {
  userId: string;
  onClose: (value: any) => void;
}

export default function UserDetailsModal({ userId, onClose }: UserDetailsModalProps) {
  const apiClient = useApiClient({ requireAuth: true });

  const { data } = useQuery({
    queryKey: ["user-details", userId],
    queryFn: () => fetchUserFullDetails(userId, apiClient.getHeaders() as Record<string, string>),
    enabled: !!userId && apiClient.isReady,
  });

  const profileImageUrl = data?.data?.profileImage;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] w-full max-w-3xl max-h-[80vh] overflow-y-auto font-['Inter'] text-gray-900">
        <div className="p-6 relative">
          <button
            onClick={() => onClose(null)}
            className="absolute top-4 right-4 w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all duration-300"
          >
            <i className="fas fa-times"></i>
          </button>
          <div className="mb-6 flex items-center gap-6 max-[768px]:flex-col max-[768px]:items-start max-[768px]:p-4">
            <img
              src={profileImageUrl || PROFILE_DEFAULT_URL}
              alt="Sarah Wilson"
              className="w-[120px] h-[120px] rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {data?.data?.name}
                </h2>
                <div className="text-gray-500 text-sm mb-2">
                  {data?.data?.username}
                </div>
              </div>
              <div className="flex gap-4 flex-wrap max-[768px]:flex-col max-[768px]:gap-2">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <i className="fas fa-calendar-alt"></i>
                  <span className="whitespace-nowrap">
                    {data?.data?.createdAt &&
                      new Date(data?.data?.createdAt)
                        .toISOString()
                        .split("T")[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{data?.data?.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${
                          data?.data?.isBlocked
                            ? "bg-[rgba(239,68,68,0.1)] text-red-500 before:bg-red-500"
                            : "bg-[rgba(34,197,94,0.1)] text-green-500 before:bg-green-500"
                        }
                        before:content-[''] before:inline-block before:w-2 before:h-2 before:rounded-full`}
                  >
                    {data?.data?.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200 max-[768px]:flex-col max-[768px]:border-b-0">
              <button
                className="px-6 py-4 font-medium text-gray-500 bg-transparent border-none text-sm border-b-4 border-transparent transition-all duration-300 hover:text-indigo-600 active:text-indigo-600 active:border-b-4 active:border-indigo-600 max-[768px]:border-b border-gray-200 max-[768px]:border-l-4 max-[768px]:text-left max-[768px]:px-4 max-[768px]:py-3"
                data-tab="profile"
              >
                Profile
              </button>
              {/* <button
                className="px-6 py-4 font-medium text-gray-500 bg-transparent border-none text-sm border-b-4 border-transparent transition-all duration-300 hover:text-indigo-600 max-[768px]:border-b border-gray-200 max-[768px]:border-l-4 max-[768px]:text-left max-[768px]:px-4 max-[768px]:py-3"
                data-tab="roles"
              >
                Roles & Permissions
              </button> */}
            </div>

            <div className="p-6 block max-[768px]:p-4" id="profile-tab">
              <div className="mb-4">
                <label
                  className="block font-medium mb-2 text-sm"
                  htmlFor="userBio"
                >
                  Bio
                </label>
                <div
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:border-indigo-600 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.2)] min-h-[120px]"
                  id="userBio"
                >
                  {data?.data?.bio}
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium mb-2 text-sm">
                  Admin Actions
                </label>
                <div className="flex gap-3">
                  <Link
                    href={`/admin/users/${userId}/reported-content`}
                    onClick={() => onClose(null)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm transition-colors"
                  >
                    <i className="fas fa-flag mr-2"></i>
                    View Reported Content
                  </Link>
                  <Link
                    href={`/admin/users/${userId}/reports`}
                    onClick={() => onClose(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm transition-colors"
                  >
                    <i className="fas fa-history mr-2"></i>
                    View Reports History
                  </Link>
                </div>
              </div>
              {/* <div className="mb-4">
                <label className="block font-medium mb-2 text-sm">Skills</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>JavaScript</span>
                    <i className="fas fa-times text-gray-500 cursor-pointer transition-all duration-300 hover:text-red-500"></i>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>React</span>
                    <i className="fas fa-times text-gray-500 cursor-pointer transition-all duration-300 hover:text-red-500"></i>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>Vue.js</span>
                    <i className="fas fa-times text-gray-500 cursor-pointer transition-all duration-300 hover:text-red-500"></i>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>TypeScript</span>
                    <i className="fas fa-times text-gray-500 cursor-pointer transition-all duration-300 hover:text-red-500"></i>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>CSS</span>
                    <i className="fas fa-times text-gray-500 cursor-pointer transition-all duration-300 hover:text-red-500"></i>
                  </div>
                </div>
              </div> */}
            </div>

            <div className="p-6 hidden max-[768px]:p-4" id="roles-tab">
              <div className="mb-4">
                <label className="block font-medium mb-2 text-sm">
                  User Role
                </label>
                <div>
                  <div className="flex items-start gap-3 py-3 border-b border-gray-200">
                    <input
                      type="radio"
                      name="userRole"
                      id="roleUser"
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="roleUser"
                        className="font-medium mb-1 text-sm"
                      >
                        User
                      </label>
                      <p className="text-sm text-gray-500">
                        Standard user with basic access to platform features.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3 border-b border-gray-200">
                    <input
                      type="radio"
                      name="userRole"
                      id="roleDeveloper"
                      className="mt-1"
                      defaultChecked
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="roleDeveloper"
                        className="font-medium mb-1 text-sm"
                      >
                        Developer
                      </label>
                      <p className="text-sm text-gray-500">
                        Developer with access to all projects and collaboration
                        features.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3 border-b border-gray-200">
                    <input
                      type="radio"
                      name="userRole"
                      id="roleModerator"
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="roleModerator"
                        className="font-medium mb-1 text-sm"
                      >
                        Moderator
                      </label>
                      <p className="text-sm text-gray-500">
                        Can moderate content, approve posts, and manage
                        community discussions.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 py-3">
                    <input
                      type="radio"
                      name="userRole"
                      id="roleAdmin"
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="roleAdmin"
                        className="font-medium mb-1 text-sm"
                      >
                        Administrator
                      </label>
                      <p className="text-sm text-gray-500">
                        Full access to all platform features including user
                        management and system settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
