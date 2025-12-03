import { MappedNotification, NotificationActor } from "./types";
import { PROFILE_DEFAULT_URL } from "@/src/constents/index";
import { GetNotificationsResult } from "@/src/app/types";

/**
 * Maps backend notification types to frontend notification types
 */
const BACKEND_TO_FRONTEND_TYPE_MAP: Record<string, MappedNotification["type"]> = {
  LIKE: "like",
  COMMENT: "comment",
  MENTION: "mention",
  FOLLOW: "follow",
  NEW_MESSAGE: "message",
  ROOM_REMINDER: "system",
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
  
  // Check summary text for share-related keywords
  const summaryText = summary?.text?.toLowerCase() || "";
  if (summaryText.includes("shared") || summaryText.includes("reposted") || summaryText.includes("reshared")) {
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
  isShare: boolean
): string => {
  if (isShare) {
    return "shared your post";
  }
  
  switch (type) {
    case "LIKE":
      return entityType === "POST" ? "liked your post" : "liked your comment";
    case "COMMENT":
      return isReply ? "replied to your comment" : "commented on your post";
    case "MENTION":
      return "mentioned you in a comment";
    case "FOLLOW":
      return "started following you";
    case "NEW_MESSAGE":
      return "sent you a message";
    case "ROOM_REMINDER":
      return "reminder";
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
      content: notification.metadata.content,
      imageUrl: notification.metadata.imageUrl,
    };
  }
  
  // Check if summary has preview
  if (notification.summary?.preview) {
    return {
      type: notification.entityType === "COMMENT" ? "comment" : "post",
      content: notification.summary.preview.content || notification.summary.preview.text || "",
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
  
  // Extract actors
  const actors = extractActors(notification.summary);
  
  // Get primary actor info
  const primaryActorName = getPrimaryActorName(actors, notification.summary);
  const primaryActorAvatar = getPrimaryActorAvatar(actors, notification.summary);
  
  // Get action text
  const actionText = getActionText(backendType, entityType, isReplyNotification, isShareNotification);
  
  // Get preview
  const preview = extractPreview(notification);
  
  // Format title (actor name(s)) - LinkedIn style
  const aggregatedCount = notification.aggregatedCount || 1;
  let title = primaryActorName;
  
  // If we have multiple actors with names, format them properly
  if (aggregatedCount > 1) {
    const namedActors = actors.filter(a => a.name && a.name !== "Someone");
    
    if (namedActors.length >= 2 && aggregatedCount === 2) {
      // "John and Jane"
      title = `${namedActors[0].name} and ${namedActors[1].name}`;
    } else if (aggregatedCount > 2) {
      // "John and 2 others"
      title = `${primaryActorName} and ${aggregatedCount - 1} others`;
    } else if (aggregatedCount > 1) {
      // Fallback: "John and 1 other"
      title = `${primaryActorName} and ${aggregatedCount - 1} other${aggregatedCount - 1 > 1 ? 's' : ''}`;
    }
  }
  
  return {
    id: notification.id,
    type: frontendType,
    isRead: !!notification.readAt || !!notification.read,
    avatarUrl: primaryActorAvatar,
    title,
    time: new Date(notification.createdAt),
    message: notification.summary?.text || actionText,
    actors: actors.length > 0 ? actors : [{ name: primaryActorName, profilePicture: primaryActorAvatar }],
    aggregatedCount,
    entityType,
    entityId: notification.entityId,
    preview,
    actionText,
  };
};

