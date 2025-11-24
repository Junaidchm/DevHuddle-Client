export type NotificationType =
  | "mention"
  | "event"
  | "like"
  | "collab"
  | "message"
  | "follow"
  | "comment"
  | "support";

export interface MappedNotification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  avatarUrl: string;
  title: string;
  time: Date;
  message: string;
}