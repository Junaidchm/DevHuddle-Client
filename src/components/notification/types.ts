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
  | "system";

export interface NotificationActor {
  id?: string;
  name?: string;
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
  preview?: {
    type: "post" | "comment" | "reply";
    content: string;
    imageUrl?: string;
  };
  actionText: string; // e.g., "liked your post", "commented on your post"
}