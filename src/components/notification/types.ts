export type NotificationType =
  | "mention"
  | "event"
  | "like"
  | "collab"
  | "message"
  | "follow"
  | "comment"
  | "support"
  | "reply"
  | "share"
  | "live"
  | "report"
  | "hub_join_request"
  | "system";

export interface NotificationActor {
  id?: string;
  name?: string;
  username?: string;
  profilePicture?: string;
}

export interface MappedNotification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  avatarUrl: string;
  title: string;
  time: Date;
  message: string;
  // LinkedIn-style fields
  actors: NotificationActor[];
  aggregatedCount?: number;
  entityType?: string;
  entityId?: string;
  postId?: string;
  projectId?: string;
  commentId?: string;
  hubId?: string;
  conversationId?: string;   // For deep-linking to a specific chat
  contextLabel?: string;     // Rich human-readable context e.g. "your post", "DevHub group"
  preview?: {
    type: "post" | "comment" | "reply";
    content: string;
    imageUrl?: string;
  };
  actionText: string; // e.g., "liked your post", "commented on your post"
}