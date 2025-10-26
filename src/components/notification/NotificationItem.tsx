"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    unread: boolean;
    avatar?: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    title: string;
    time: string;
    message: string;
    project?: string;
    actions: string[];
    hasButtons?: boolean;
  };
  onMarkAsRead: () => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [accepted, setAccepted] = useState(false);
  const [declined, setDeclined] = useState(false);

  const handleAccept = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notification.id}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        }
      );
      if (response.ok) {
        setAccepted(true);
        onMarkAsRead();
        queryClient.invalidateQueries({
          queryKey: ["notifications", session?.user?.id],
        });
        alert(
          "Collaboration invitation accepted! You will be redirected to the project workspace."
        );
      }
    } catch (error) {
      console.error("Failed to accept collaboration:", error);
    }
  };

  const handleDecline = async () => {
    if (
      confirm("Are you sure you want to decline this collaboration invitation?")
    ) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notification.id}/decline`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          }
        );
        if (response.ok) {
          setDeclined(true);
          onMarkAsRead();
          queryClient.invalidateQueries({
            queryKey: ["notifications", session?.user?.id],
          });
        }
      } catch (error) {
        console.error("Failed to decline collaboration:", error);
      }
    }
  };

  return (
    <div
      className={`flex p-[1.25rem] border-b border-[#e5e7eb] transition-all duration-[0.2s] relative last:border-b-0 hover:bg-[#f3f4f6] ${
        notification.unread
          ? 'bg-[rgba(79,70,229,0.05)] before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-[#4f46e5]'
          : ""
      }`}
    >
      {notification.avatar ? (
        <div className="w-[3rem] h-[3rem] rounded-[50%] overflow-hidden flex-shrink-0 mr-[1rem]">
          <img
            src={notification.avatar}
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className="w-[3rem] h-[3rem] rounded-[50%] flex-shrink-0 mr-[1rem] flex items-center justify-center text-[1.25rem]"
          style={{
            backgroundColor: notification.iconBg,
            color: notification.iconColor,
          }}
        >
          <i className={notification.icon}></i>
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center justify-between mb-[0.25rem]">
          <div className="font-[600] text-[#1f2937]">{notification.title}</div>
          <div className="text-[0.8rem] text-[#6b7280]">
            {notification.time}
          </div>
        </div>

        <div className="text-[#6b7280] text-[0.95rem] mb-[0.5rem]">
          {notification.message.split(/(\*\*.*?\*\*)/).map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={index} className="text-[#1f2937] font-[500]">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </div>

        {notification.project && (
          <div className="inline-flex items-center gap-[0.35rem] text-[0.85rem] text-[#4f46e5] px-[0.75rem] py-[0.35rem] bg-[rgba(79,70,229,0.1)] rounded-[0.35rem] mt-[0.5rem]">
            <i className="fas fa-code-branch"></i> {notification.project}
          </div>
        )}

        {notification.hasButtons && !accepted && !declined && (
          <div className="flex gap-[0.75rem] mt-[0.75rem]">
            <button
              onClick={handleAccept}
              className="inline-flex items-center gap-[0.5rem] px-[1rem] py-[0.4rem] border-none rounded-[0.5rem] font-[500] cursor-pointer transition-all duration-[0.2s] text-[0.875rem] bg-[#4f46e5] text-white hover:bg-[#4338ca]"
            >
              Accept Invitation
            </button>
            <button
              onClick={handleDecline}
              className="inline-flex items-center gap-[0.5rem] px-[1rem] py-[0.4rem] border-none rounded-[0.5rem] font-[500] cursor-pointer transition-all duration-[0.2s] text-[0.875rem] bg-transparent text-[#1f2937] border border-[#e5e7eb] hover:bg-[#f3f4f6]"
            >
              Decline
            </button>
          </div>
        )}

        {accepted && (
          <div className="flex gap-[0.75rem] mt-[0.75rem]">
            <button
              disabled
              className="inline-flex items-center gap-[0.5rem] px-[1rem] py-[0.4rem] border-none rounded-[0.5rem] font-[500] cursor-not-allowed transition-all duration-[0.2s] text-[0.875rem] bg-[#10b981] text-white"
            >
              Accepted
            </button>
          </div>
        )}

        {declined && (
          <div className="flex gap-[0.75rem] mt-[0.75rem]">
            <button
              disabled
              className="inline-flex items-center gap-[0.5rem] px-[1rem] py-[0.4rem] border-none rounded-[0.5rem] font-[500] cursor-not-allowed transition-all duration-[0.2s] text-[0.875rem] bg-transparent text-[#1f2937] border border-[#e5e7eb]"
            >
              Declined
            </button>
          </div>
        )}

        <div className="flex items-center justify-end mt-[0.5rem]">
          {notification.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => action === "Mark as Read" && onMarkAsRead()}
              className="bg-none border-none text-[#6b7280] text-[0.85rem] cursor-pointer px-[0.5rem] py-[0.25rem] ml-[1rem] transition-all duration-[0.2s] hover:text-[#4f46e5]"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
