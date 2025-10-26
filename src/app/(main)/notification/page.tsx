// "use client";

// import NotificationItem from "@/src/components/notification/NotificationItem";
// import PreferencesSection from "@/src/components/notification/PreferencesSection";
// import { useNotifications, useUnreadCount } from "@/src/customHooks/useNotifications";
// import { useWebSocketNotifications } from "@/src/customHooks/useWebSocketNotifications";
// import { useQueryClient } from "@tanstack/react-query";
// import { useSession } from "next-auth/react";
// import { useState, useEffect } from "react";
// // import { useNotifications, useUnreadCount } from '@/hooks/useNotifications';
// // import { useWebSocketNotifications } from '@/hooks/useWebSocketNotifications';
// // import NotificationItem from '@/components/NotificationItem';
// // import Footer from '@/components/Footer';
// // import PreferencesSection from '@/components/PreferencesSection';
// // import { useSession } from 'next-auth/react';
// // import { useQueryClient } from '@tanstack/react-query';

// // Map backend notification to frontend format
// interface Notification {
//   id: string;
//   type:
//     | "mention"
//     | "event"
//     | "like"
//     | "collab"
//     | "message"
//     | "follow"
//     | "comment"
//     | "support";
//   unread: boolean;
//   avatar?: string;
//   icon?: string;
//   iconBg?: string;
//   iconColor?: string;
//   title: string;
//   time: string;
//   message: string;
//   project?: string;
//   actions: string[];
//   hasButtons?: boolean;
// }

// export default function NotificationsPage() {
//   const { data: session } = useSession();
//   const userId = session?.user?.id;
//   const queryClient = useQueryClient();
//   const { data: notifications = [], isLoading } = useNotifications();
//   const { data: unreadData } = useUnreadCount();
//   const unreadCount = unreadData?.unreadCount || 0;
//   const [activeFilter, setActiveFilter] = useState("all");

//   // Connect WebSocket
//   useWebSocketNotifications();

//   // Map backend notifications to frontend format
//   const mappedNotifications: Notification[] = notifications.map((n) => {
//     const isUnread = !n.readAt;
//     const typeMap: Record<string, Notification["type"]> = {
//       FOLLOW: "follow",
//       MENTION: "mention",
//       COMMENT: "comment",
//       LIKE: "like",
//       COLLAB: "collab",
//       EVENT: "event",
//       MESSAGE: "message",
//       SUPPORT: "support",
//     };
//     return {
//       id: n.id,
//       type: typeMap[n.type] || "follow",
//       unread: isUnread,
//       avatar: n.summary.actors[0]
//         ? `https://randomuser.me/api/portraits/men/${Math.floor(
//             Math.random() * 100
//           )}.jpg`
//         : undefined,
//       icon: n.type === "FOLLOW" ? "fas fa-user-plus" : undefined,
//       iconBg: n.type === "FOLLOW" ? "rgba(16, 185, 129, 0.1)" : undefined,
//       iconColor: n.type === "FOLLOW" ? "#10b981" : undefined,
//       title: n.summary.actors.join(", ") || "System",
//       time: new Date(n.createdAt).toLocaleString(),
//       message: n.summary.text,
//       project: n.type === "COLLAB" ? "Some Project" : undefined,
//       actions: isUnread ? ["Mark as Read", "View"] : ["View"],
//       hasButtons: n.type === "COLLAB",
//     };
//   });

//   const markAllAsRead = async () => {
//     if (!userId) return;
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/notifications/${userId}/mark-all-read`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${session?.user?.accessToken}`,
//           },
//         }
//       );
//       if (response.ok) {
//         queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
//         queryClient.setQueryData(["unreadCount", userId], { unreadCount: 0 });
//       }
//     } catch (error) {
//       console.error("Failed to mark all as read:", error);
//     }
//   };

//   const markAsRead = async (id: string) => {
//     if (!userId) return;
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/mark-read`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${session?.user?.accessToken}`,
//           },
//         }
//       );
//       if (response.ok) {
//         queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
//         queryClient.setQueryData(["unreadCount", userId], (old: any) => ({
//           unreadCount: Math.max(0, (old?.unreadCount || 0) - 1),
//         }));
//       }
//     } catch (error) {
//       console.error("Failed to mark as read:", error);
//     }
//   };

//   const filterNotifications = () => {
//     if (activeFilter === "all") return mappedNotifications;
//     return mappedNotifications.filter((n) => n.type === activeFilter);
//   };

//   const filteredNotifications = filterNotifications();
//   const todayNotifications = filteredNotifications.filter((n: any) => {
//     const date = new Date(n.createdAt as string);
//     return date > new Date(Date.now() - 24 * 60 * 60 * 1000);
//   });
//   const yesterdayNotifications = filteredNotifications.filter((n: any) => {
//     const date = new Date(n.createdAt as string);
//     return (
//       date > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) &&
//       date <= new Date(Date.now() - 24 * 60 * 60 * 1000)
//     );
//   });
//   const weekNotifications = filteredNotifications.filter((n: any) => {
//     const date = new Date(n.createdAt as string);
//     return date <= new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
//   });

//   if (isLoading) {
//     return <div>Loading notifications...</div>;
//   }

//   if (!userId) {
//     return <div>Please log in to view notifications.</div>;
//   }

//   return (
//     <div className="font-['Inter',sans-serif]  text-[#1f2937] leading-[1.5] box-border m-0 p-0">

//       <div className="max-w-[900px] mx-auto my-[2rem] px-[1.5rem]">
//         <div className="flex items-center justify-between mb-[1.5rem]">
//           <h1 className="text-[1.75rem] font-[700] text-[#1f2937] flex items-center gap-[0.5rem]">
//             <i className="fas fa-bell text-[#4f46e5]"></i> Notifications
//           </h1>
//           <div className="flex gap-[0.75rem]">
//             <button
//               onClick={markAllAsRead}
//               className="inline-flex items-center gap-[0.5rem] px-[1.25rem] py-[0.6rem] border-none rounded-[0.5rem] font-[500] cursor-pointer transition-all duration-[0.2s] text-[0.9rem] bg-transparent text-[#1f2937] border border-[#e5e7eb] hover:bg-[#f3f4f6]"
//             >
//               <i className="fas fa-check-double"></i> Mark All as Read
//             </button>
//             <button className="inline-flex items-center gap-[0.5rem] px-[1.25rem] py-[0.6rem] border-none rounded-[0.5rem] font-[500] cursor-pointer transition-all duration-[0.2s] text-[0.9rem] bg-transparent text-[#1f2937] border border-[#e5e7eb] hover:bg-[#f3f4f6]">
//               <i className="fas fa-cog"></i> Settings
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center bg-white rounded-[0.75rem] shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.06)] mb-[1.5rem] overflow-hidden">
//           {[
//             { id: "all", label: "All", count: unreadCount },
//             {
//               id: "mentions",
//               label: "Mentions",
//               count: filteredNotifications.filter(
//                 (n) => n.type === "mention" && n.unread
//               ).length,
//             },
//             {
//               id: "comments",
//               label: "Comments",
//               count: filteredNotifications.filter(
//                 (n) => n.type === "comment" && n.unread
//               ).length,
//             },
//             {
//               id: "likes",
//               label: "Likes",
//               count: filteredNotifications.filter(
//                 (n) => n.type === "like" && n.unread
//               ).length,
//             },
//             {
//               id: "follows",
//               label: "Follows",
//               count: filteredNotifications.filter(
//                 (n) => n.type === "follow" && n.unread
//               ).length,
//             },
//             {
//               id: "collaboration",
//               label: "Collaboration Requests",
//               count: filteredNotifications.filter(
//                 (n) => n.type === "collab" && n.unread
//               ).length,
//             },
//             {
//               id: "messages",
//               label: "Messages",
//               count: filteredNotifications.filter(
//                 (n) => n.type === "message" && n.unread
//               ).length,
//             },
//             {
//               id: "events",
//               label: "Events",
//               count: filteredNotifications.filter(
//                 (n) => n.type === "event" && n.unread
//               ).length,
//             },
//           ].map((filter) => (
//             <div
//               key={filter.id}
//               onClick={() => setActiveFilter(filter.id)}
//               className={`flex-1 p-[1rem] text-center font-[500] cursor-pointer transition-all duration-[0.2s] text-[#1f2937] relative hover:bg-[#f3f4f6] ${
//                 activeFilter === filter.id
//                   ? 'text-[#4f46e5] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[3px] after:bg-[#4f46e5]'
//                   : ""
//               }`}
//             >
//               {filter.label}{" "}
//               {filter.count > 0 && (
//                 <span className="inline-block bg-[#4f46e5] text-white text-[0.75rem] px-[0.5rem] py-[0.15rem] rounded-[1rem] ml-[0.5rem]">
//                   {filter.count}
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>

//         <div className="bg-white rounded-[0.75rem] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] overflow-hidden">
//           {todayNotifications.length > 0 && (
//             <>
//               <div className="px-[1.25rem] py-[0.75rem] bg-[#f3f4f6] font-[600] text-[0.85rem] text-[#1f2937] border-b border-[#e5e7eb]">
//                 Today
//               </div>
//               {todayNotifications.map((notification) => (
//                 <NotificationItem
//                   key={notification.id}
//                   notification={notification}
//                   onMarkAsRead={() => markAsRead(notification.id)}
//                 />
//               ))}
//             </>
//           )}

//           {yesterdayNotifications.length > 0 && (
//             <>
//               <div className="px-[1.25rem] py-[0.75rem] bg-[#f3f4f6] font-[600] text-[0.85rem] text-[#1f2937] border-b border-[#e5e7eb]">
//                 Yesterday
//               </div>
//               {yesterdayNotifications.map((notification) => (
//                 <NotificationItem
//                   key={notification.id}
//                   notification={notification}
//                   onMarkAsRead={() => markAsRead(notification.id)}
//                 />
//               ))}
//             </>
//           )}

//           {weekNotifications.length > 0 && (
//             <>
//               <div className="px-[1.25rem] py-[0.75rem] bg-[#f3f4f6] font-[600] text-[0.85rem] text-[#1f2937] border-b border-[#e5e7eb]">
//                 Previous Week
//               </div>
//               {weekNotifications.map((notification) => (
//                 <NotificationItem
//                   key={notification.id}
//                   notification={notification}
//                   onMarkAsRead={() => markAsRead(notification.id)}
//                 />
//               ))}
//             </>
//           )}

//           <div className="flex justify-center p-[1.5rem] bg-white border-t border-[#e5e7eb]">
//             <button className="inline-flex items-center gap-[0.5rem] px-[1.25rem] py-[0.6rem] border-none rounded-[0.5rem] font-[500] cursor-pointer transition-all duration-[0.2s] text-[0.9rem] bg-transparent text-[#1f2937] border border-[#e5e7eb] hover:bg-[#f3f4f6]">
//               <i className="fas fa-sync-alt"></i> Load More
//             </button>
//           </div>
//         </div>
//       </div>

//       <PreferencesSection />
//     </div>
//   );
// }
