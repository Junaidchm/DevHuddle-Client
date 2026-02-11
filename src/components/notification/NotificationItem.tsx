"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { Check, X, GitBranch, Bell } from "lucide-react";

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
      className={cn(
        "flex p-4 border-b border-border transition-colors hover:bg-muted/30 relative",
        notification.unread && "bg-blue-50/50 hover:bg-blue-50/70 dark:bg-blue-950/10 dark:hover:bg-blue-950/20"
      )}
    >
        {notification.unread && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
        )}

      {notification.avatar ? (
        <Avatar className="w-12 h-12 mr-4 border border-border">
             <AvatarImage src={notification.avatar || PROFILE_DEFAULT_URL} alt="User" className="object-cover" />
             <AvatarFallback>U</AvatarFallback>
        </Avatar>
      ) : (
        <div
          className="w-12 h-12 rounded-full mr-4 flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: notification.iconBg || "#f3f4f6",
            color: notification.iconColor || "#6b7280",
          }}
        >
          {/* We might need to render icons dynamically if passed as string names, 
              but for now keeping it simple as it seems to be passing class names or similar */}
          <Bell className="w-5 h-5" /> 
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="font-semibold text-foreground text-sm">{notification.title}</div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {notification.time}
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-2 leading-relaxed">
          {notification.message.split(/(\*\*.*?\*\*)/).map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={index} className="text-foreground font-medium">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          })}
        </div>

        {notification.project && (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary px-2 py-1 bg-primary/10 rounded-md mb-2">
            <GitBranch className="w-3 h-3" />
            {notification.project}
          </div>
        )}

        {notification.hasButtons && !accepted && !declined && (
          <div className="flex gap-3 mt-3">
            <Button
              onClick={handleAccept}
              size="sm"
              className="gap-1"
            >
              <Check className="w-4 h-4" />
              Accept Invitation
            </Button>
            <Button
              onClick={handleDecline}
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <X className="w-4 h-4" />
              Decline
            </Button>
          </div>
        )}

        {accepted && (
          <div className="flex gap-3 mt-3">
            <Button disabled size="sm" variant="outline" className="text-green-600 border-green-200 bg-green-50">
               <Check className="w-4 h-4 mr-1" /> Accepted
            </Button>
          </div>
        )}

        {declined && (
          <div className="flex gap-3 mt-3">
            <Button disabled size="sm" variant="outline" className="text-muted-foreground">
               Declined
            </Button>
          </div>
        )}

        {notification.actions && notification.actions.length > 0 && (
             <div className="flex items-center justify-end mt-2">
                {notification.actions.map((action, index) => (
                    <Button 
                        key={index} 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => action === "Mark as Read" && onMarkAsRead()}
                        className="text-xs text-muted-foreground hover:text-primary h-8"
                    >
                        {action}
                    </Button>
                ))}
             </div>
        )}
      </div>
    </div>
  );
}
