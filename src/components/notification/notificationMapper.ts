import { MappedNotification, NotificationActor } from "./types";
import { PROFILE_DEFAULT_URL } from "@/src/constants/index";
import { GetNotificationsResult } from "@/src/app/types";
import { formatSystemMessage } from "@/src/lib/chat-utils";

/**
 * Maps backend notification types to frontend notification types
 */
const BACKEND_TO_FRONTEND_TYPE_MAP: Record<string, MappedNotification["type"]> = {
  LIKE: "like",
  COMMENT: "comment",
  MENTION: "mention",
  FOLLOW: "follow",
  NEW_MESSAGE: "message",
  CHAT_MESSAGE: "message",
  ROOM_REMINDER: "system",
  SHARE: "share",
  REPORT: "report",
  HUB_JOIN_REQUEST: "hub_join_request",
  HUB_JOIN_APPROVED: "system",
  HUB_JOIN_REJECTED: "system",
  CONTENT_HIDDEN: "system",
  // Handle legacy types
  COLLAB: "collab",
  EVENT: "event",
  SUPPORT: "support",
};

/**
 * Determines if a COMMENT notification is actually a REPLY
 * (A reply is a comment on a comment, not a comment on a post)
 */
const isReply = (entityType: string, contextId?: string | null): boolean => {
  return entityType === "COMMENT" && !!contextId;
};

/**
 * Determines if a notification is a SHARE/REPOST
 * This would typically be in metadata or a separate type
 * Also check summary text for share-related keywords
 */
const isShare = (type: string, metadata?: any, summary?: any): boolean => {
  if (type === "SHARE" || metadata?.isShare === true || metadata?.isRepost === true) {
    return true;
  }
  
  // NEW_MESSAGE with a postId is a LinkedIn-style "sent you a post" which we'll treat as a share category
  if (type === "NEW_MESSAGE" && metadata?.postId) {
    return true;
  }
  
  // Check summary text for share-related keywords
  const summaryText = summary?.text?.toLowerCase() || "";
  if (summaryText.includes("shared") || summaryText.includes("reposted") || summaryText.includes("reshared") || summaryText.includes("sent you a post")) {
    return true;
  }
  
  return false;
};

/**
 * Gets the action text for a notification (LinkedIn-style)
 */
const getActionText = (
  type: string,
  entityType: string,
  isReply: boolean,
  isShare: boolean,
  metadata?: any
): string => {
  if (type === "NEW_MESSAGE") {
    return "sent you a post";
  }

  if (type === "CHAT_MESSAGE") {
    return "sent you a message";
  }
  
  if (isShare) {
    return type === "SHARE" ? "shared your post" : "sent you a post";
  }
  
  switch (type) {
    case "LIKE":
      if (entityType === "POST") return "liked your post";
      if (entityType === "PROJECT") return "liked your project";
      return "liked your comment";
    case "COMMENT":
      return isReply ? "replied to your comment" : "commented on your post";
    case "MENTION":
      return "mentioned you in a comment";
    case "FOLLOW":
      return "started following you";
    case "ROOM_REMINDER":
      return "reminder";
    case "SHARE":
      return "shared your post";
    case "REPORT":
      return "reported your content";
    case "HUB_JOIN_REQUEST":
      return "requested to join your hub";
    case "HUB_JOIN_APPROVED":
      return "approved your request to join the hub";
    case "HUB_JOIN_REJECTED":
      return "rejected your request to join the hub";
    case "CONTENT_HIDDEN": {
      // Use metadata to get the specific action and content type
      const action = metadata?.action as string | undefined;
      const contentType = (metadata?.entityType as string || entityType || "content").toLowerCase();
      if (action === "HIDE") return `hid your ${contentType}`;
      if (action === "UNHIDE") return `restored your ${contentType}`;
      if (action === "DELETE") return `permanently deleted your ${contentType}`;
      return `took action on your ${contentType}`;
    }
    default:
      return "interacted with your content";
  }
};

/**
 * Extracts actors from notification summary
 * ✅ FIXED: Now handles backend format with full actor info (name, profilePicture, username)
 */
const extractActors = (summary: any): NotificationActor[] => {
  if (!summary) return [];
  
  // Handle both direct summary and nested json format
  const summaryData = summary?.json || summary;
  if (!summaryData?.actors) return [];
  
  if (Array.isArray(summaryData.actors) && summaryData.actors.length > 0) {
    const firstActor = summaryData.actors[0];
    
    // ✅ NEW: Backend now returns full actor objects with name, profilePicture, username
    if (typeof firstActor === "object" && firstActor !== null) {
      return summaryData.actors.map((actor: any) => ({
        id: actor.id || actor.actorId || actor,
        name: actor.name || "Unknown User",
        username: actor.username || "",
        profilePicture: actor.profilePicture || null,
      }));
    }
    
    // Fallback: actors are just IDs (shouldn't happen with new backend)
    return summaryData.actors.map((actorId: string) => ({
      id: actorId,
      name: "Unknown User",
      profilePicture: null,
    }));
  }
  
  return [];
};

/**
 * Extracts actor name from summary text
 * Example: "John Doe liked your post" -> "John Doe"
 * Example: "John and 2 others liked your post" -> "John"
 */
const extractActorNameFromText = (text: string): string => {
  if (!text) return "Someone";
  
  // Try to extract name from patterns like "John Doe liked", "John and 2 others liked"
  const patterns = [
    /^([^and]+?)\s+(liked|commented|mentioned|followed|shared|replied|started)/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/, // Capitalized name(s)
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      // Don't return if it's just "Someone" or similar
      if (name.length > 1 && !name.toLowerCase().includes("someone")) {
        return name;
      }
    }
  }
  
  // Fallback: try to get first word(s)
  const words = text.split(" ");
  if (words.length > 0) {
    // If it's "X and Y others", return X
    if (words.length >= 3 && words[1]?.toLowerCase() === "and") {
      return words[0];
    }
    // Return first word if it looks like a name (capitalized)
    if (words[0] && /^[A-Z]/.test(words[0])) {
      return words[0];
    }
  }
  
  return "Someone";
};

/**
 * Gets the primary actor's profile picture
 * ✅ FIXED: Now uses actor info from backend
 */
const getPrimaryActorAvatar = (actors: NotificationActor[], summary: any): string => {
  // ✅ FIXED: Use actor info from extracted actors first
  if (actors.length > 0 && actors[0].profilePicture) {
    return actors[0].profilePicture;
  }
  
  // Fallback to summary if available
  const summaryData = summary?.json || summary;
  if (summaryData?.actors?.[0]?.profilePicture) {
    return summaryData.actors[0].profilePicture;
  }
  
  return PROFILE_DEFAULT_URL;
};

/**
 * Gets the primary actor's name
 * ✅ FIXED: Now uses real actor names from backend
 */
const getPrimaryActorName = (actors: NotificationActor[], summary: any): string => {
  // ✅ FIXED: Use real actor name from extracted actors
  if (actors.length > 0 && actors[0].name && actors[0].name !== "Unknown User") {
    return actors[0].name;
  }
  
  // Fallback to summary text extraction
  const summaryData = summary?.json || summary;
  if (summaryData?.text) {
    const extractedName = extractActorNameFromText(summaryData.text);
    if (extractedName && extractedName !== "Someone") {
      return extractedName;
    }
  }
  
  return "Someone";
};

/**
 * Extracts preview content from notification metadata or summary
 */
const extractPreview = (notification: GetNotificationsResult["notifications"][0]): MappedNotification["preview"] => {
  // Check metadata for preview content
  if (notification.metadata?.content) {
    return {
      type: notification.entityType === "COMMENT" ? "comment" : "post",
      content: formatSystemMessage(notification.metadata.content),
      imageUrl: notification.metadata.imageUrl,
    };
  }
  
  // Check if summary has preview
  if (notification.summary?.preview) {
    return {
      type: notification.entityType === "COMMENT" ? "comment" : "post",
      content: formatSystemMessage(notification.summary.preview.content || notification.summary.preview.text || ""),
      imageUrl: notification.summary.preview.imageUrl,
    };
  }
  
  return undefined;
};

/**
 * Maps a backend notification to a LinkedIn-style frontend notification
 */
export const mapNotificationToLinkedInStyle = (
  notification: GetNotificationsResult["notifications"][0]
): MappedNotification => {
  const backendType = notification.type;
  const entityType = notification.entityType;
  const isReplyNotification = isReply(entityType, notification.contextId);
  const isShareNotification = isShare(backendType, notification.metadata, notification.summary);
  
  // Determine frontend type
  let frontendType: MappedNotification["type"] = BACKEND_TO_FRONTEND_TYPE_MAP[backendType] || "system";
  
  // Override for reply
  if (isReplyNotification && frontendType === "comment") {
    frontendType = "reply";
  }
  
  // Override for share
  if (isShareNotification) {
    frontendType = "share";
  }
  
  // Extract actors - Prioritize root actors provided by backend enrichment
  const actors = (notification as any).actors && (notification as any).actors.length > 0
    ? (notification as any).actors.map((actor: any) => ({
        id: actor.id || actor.actorId || actor,
        name: actor.name || "Unknown User",
        username: actor.username || "",
        profilePicture: actor.profilePicture || null,
      }))
    : extractActors(notification.summary);
  
  // Get primary actor info
  const primaryActorName = getPrimaryActorName(actors, notification.summary);
  const primaryActorAvatar = getPrimaryActorAvatar(actors, notification.summary);
  
  // Get action text — pass metadata so CONTENT_HIDDEN can render specific verb
  const actionText = getActionText(backendType, entityType, isReplyNotification, isShareNotification, notification.metadata);
  
  // Get preview
  const preview = extractPreview(notification);
  
  // Format title (actor name(s)) - LinkedIn style
  const aggregatedCount = notification.aggregatedCount || 1;
  let title = primaryActorName;
  
  // If we have multiple actors with names, format them properly
  if (aggregatedCount > 1) {
    const namedActors = actors.filter((a: NotificationActor) => a.name && a.name !== "Someone");
    
    if (namedActors.length >= 2 && aggregatedCount === 2) {
      title = `${namedActors[0].name} and ${namedActors[1].name}`;
    } else if (aggregatedCount > 2) {
      title = `${primaryActorName} and ${aggregatedCount - 1} others`;
    } else if (aggregatedCount > 1) {
      title = `${primaryActorName} and ${aggregatedCount - 1} other${aggregatedCount - 1 > 1 ? 's' : ''}`;
    }
  }

  // Derive entity routing IDs
  // For admin CONTENT_HIDDEN: entityType & entityId carry the target content
  const isAdminAction = backendType === "CONTENT_HIDDEN";
  let projectId: string | undefined;
  let postId: string | undefined;
  let commentId: string | undefined;
  let hubId: string | undefined;

  if (isAdminAction) {
    // contextId holds the real entity ID (the DB entityId is a composite key entityId::ACTION)
    const realEntityId = notification.contextId || notification.entityId;
    if (entityType === "PROJECT") {
      projectId = realEntityId;
    } else if (entityType === "POST") {
      postId = realEntityId;
    } else if (entityType === "HUB") {
      hubId = realEntityId;
    } else if (entityType === "COMMENT") {
      commentId = realEntityId;
      // Comments are nested — navigate to parent post or project
      postId = notification.metadata?.postId || undefined;
      projectId = notification.metadata?.projectId || undefined;
    }
  } else {
    projectId = notification.metadata?.projectId || (notification.entityType === "PROJECT" ? notification.entityId : (notification.entityType === "COMMENT" && notification.metadata?.projectId ? notification.contextId : undefined));
    postId = notification.metadata?.postId || (notification.entityType === "POST" ? notification.entityId : (notification.entityType === "COMMENT" && !notification.metadata?.projectId ? notification.contextId : undefined));
    commentId = notification.metadata?.commentId || (notification.entityType === "COMMENT" ? notification.entityId : undefined);
  }
  
  return {
    id: notification.id,
    type: frontendType,
    isRead: !!notification.readAt || !!notification.read,
    avatarUrl: primaryActorAvatar,
    title,
    time: (() => {
      const d = notification.createdAt ? new Date(notification.createdAt) : new Date();
      return isNaN(d.getTime()) ? new Date() : d;
    })(),
    message: notification.summary?.text || actionText,
    actors: actors.length > 0 ? actors : [{ name: primaryActorName, profilePicture: primaryActorAvatar }],
    aggregatedCount,
    entityType,
    entityId: notification.entityId,
    projectId,
    postId,
    commentId,
    hubId,
    preview,
    actionText,
  };
};

