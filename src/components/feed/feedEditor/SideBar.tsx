// // app/components/Sidebar.tsx
// import React from "react";
// import { redirect } from "next/navigation";
// import { auth } from "@/auth";
// import { getSuggestedUsersWithFollowerInfo } from "@/src/app/actions/follow";
// import {  FollowButtonText } from "@/src/components/FollowButton";

// interface SuggestedFollower {
//   id: string;
//   username: string;
//   name: string;
//   profilePicture: string | null;
//   _count: {
//     followers: number;
//   };
// }

// async function SidebarClient() {
//   const session = await auth();

//   if (!session?.user?.id) {
//     redirect("/signIn");
//   }

//   let usersToFollow: SuggestedFollower[] = [];
//   let followerInfoMap: Record<string, { followers: number; isFollowedByUser: boolean }> = {};

//   try {
//     // Fetch suggested users with their follower info preloaded
//     const { suggestions, followerInfoMap: preloadedFollowerInfo } = await getSuggestedUsersWithFollowerInfo(5);
//     usersToFollow = suggestions;
//     // followerInfoMap = preloadedFollowerInfo;
//   } catch (error) {
//     console.error("Error fetching suggested followers:", error);
//     return (
//       <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
//         <div className="text-xl font-bold">Who to follow</div>
//         <p className="text-muted-foreground">Unable to load suggestions</p>
//       </div>
//     );
//   }

//   if (usersToFollow.length === 0) {
//     return (
//       <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
//         <div className="text-xl font-bold">Who to follow</div>
//         <p className="text-muted-foreground">
//           No suggestions yet—start connecting!
//         </p>
//       </div>
//     );
//   }

//   return (
//     <aside className="w-[300px] flex-shrink-0">
//       <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
//         <h3 className="m-0 mb-4 text-lg font-semibold text-text-main flex items-center gap-2">
//           <svg
//             viewBox="0 0 24 24"
//             width="20"
//             height="20"
//             stroke="#8b5cf6"
//             strokeWidth="2"
//             fill="none"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//           >
//             <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//             <circle cx="9" cy="7" r="4" />
//             <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
//             <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//           </svg>
//           Who to Follow
//         </h3>
//         <div className="flex flex-col gap-4">
//           {usersToFollow.map((user, index) => (
//             <div key={user.id} className="flex items-center gap-3">
//               <div className="relative">
//                 <img
//                   src={`${process.env.NEXT_PUBLIC_IMAGE_PATH}${user.profilePicture}` || "/default-avatar.png"}
//                   alt={`${user.name}'s avatar`}
//                   className="w-[42px] h-[42px] rounded-full object-cover"
//                   aria-label="Contributor avatar"
//                 />
//                 <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] bg-success rounded-full flex items-center justify-center border-2 border-white">
//                   <span className="text-white text-[0.5rem]">{index + 1}</span>
//                 </div>
//               </div>
//               <div className="flex-1">
//                 <div className="flex justify-between items-center">
//                   {/* <span className="font-semibold text-sm text-text-main">
//                     {user.name}
//                   </span> */}
//                    <span className="font-semibold text-sm text-text-main">@{user.username}</span>
//                 </div>
//                 <div className="text-xs text-text-light flex items-center gap-1">

//                   <span className="w-1 h-1 bg-slate-300 rounded-full" />
//                   <span className="text-xs text-text-light">
//                     {followerInfoMap[user.id]?.followers || user._count.followers} followers
//                   </span>
//                 </div>
//               </div>
//               <div className="flex-shrink-0">
//                 <FollowButtonText
//                   userId={user.id}
//                   initialData={followerInfoMap[user.id]}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>

//       </div>
//     </aside>
//   );
// }

// app/components/Sidebar.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getSuggestedUsersWithFollowerInfo } from "@/src/app/actions/follow";
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from "@tanstack/react-query";
import SidebarClient from "./SideBarClient";

export default async function Sidebar() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signIn");

  const queryClient = new QueryClient();
  const suggestions = await getSuggestedUsersWithFollowerInfo(5);

  // Pre-hydrate the suggestions for the client
  await queryClient.prefetchQuery({
    queryKey: ["suggestions", session.user.id],
    queryFn: async () => suggestions,
    staleTime: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarClient id={session.user.id} />
    </HydrationBoundary>
  );
}
