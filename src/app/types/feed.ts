import { PostType } from "@/src/contexts/MediaContext";

export interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (media: Media[]) => void;
  initialMedia?: Media[];
  // setSelectedMedia: (files: Media[]) => void;
}

export interface ActionBarProps {
  onEdit: () => void;
  onTag: () => void;
  // onDuplicate: () => void;
  onDelete: () => void;
  onAddMore: () => void;
  disableActions?: boolean;
  imageCount: number;
  onDone: () => void;
  className?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface GradientButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export interface ThumbnailProps {
  image: Media;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onRemove: (imageId: string, fileName: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
}

export interface ThumbnailGalleryProps {
  images: Media[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (imageId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export type EditingTab = "crop" | "filter" | "adjust";

export interface User {
  id: string;
  name: string;
  avatar: string;
  title?: string;
}

export interface ImageData {
  id: number;
  file: File;
  preview: string;
  name: string;
  url: string;
}

export interface ImageTransform {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
  straighten: number;
  aspectRatio: string;
  filter: string;
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  highlights: number;
  shadows: number;
  altText: string;
}

export interface TaggedUsersListProps {
  taggedUsers: User[];
  onRemoveTag: (userId: number) => void;
  className?: string;
}

export type Visibility = "PUBLIC" | "VISIBILITY_CONNECTIONS";

export type CommentControl = "ANYONE" | "CONNECTIONS" | "NOBODY";

export interface PollOption {
  id: number;
  text: string;
}

export interface Poll {
  question: string;
  options: PollOption[];
  durationDays: number;
}

export interface videoTransform {}

export interface Media {
  id: string;
  file?: File;
  type: string;
  url?: string;
  name: string;
  taggedUsers?: User[];
  transform?: ImageTransform | videoTransform | null;
  mediaId?: string | undefined | null;
  thumbnail?: string; // ✅ Added thumbnail support
}

export interface Post {
  id?: string;
  type?: PostType;
  content: string;
  media?: Media[];
  poll?: Poll | null;
  visibility: Visibility;
  commentControl: CommentControl;
}

interface FeedResponsePost {
  id: string;
  userId: string;
  type: "TEXT" | "ARTICLE" | "POLL" | null;
  content: string | null;
  tags: string[];
  imageMedia: Media[];
  videoMedia: Media[];
  visibility: "PUBLIC" | "VISIBILITY_CONNECTIONS";
  commentControl: "ANYONE" | "CONNECTIONS" | "NONE";
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    username?: string;
    avatar: string;
  };
  engagement?: PostEngagement;
}

export interface submitPostProp {
  content: string;
}

export interface NewPost {
  id: string;
  content: string;
  mediaIds: string[];
  userId: string;
  createdAt: string;
  user: { name: string; username?: string; avatar: string } | null;
  visibility?: Visibility; // ✅ Added: Post visibility setting
  commentControl?: CommentControl; // ✅ Added: Comment control setting
  attachments: {
    id: string;
    postId: string;
    type: string;
    url: string;
    createdAt: string;
  }[];
  engagement?: PostEngagement;
}

export interface newPostSubmit {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user: { name: string; username?: string; avatar: string } | null;
  attachments?: {
    id: string;
    post_id: string;
    type: string;
    url: string;
    created_at: string;
  }[];
}

export interface PostsPage {
  posts: NewPost[];
  nextCursor: string | null;
}

export interface FeedResponse {
  posts: FeedResponsePost[];
  nextCursor: string | null;
}

export interface ImageData {
  id: number;
  file: File;
  preview: string;
  name: string;
  url: string;
}


// ========== ENGAGEMENT TYPES ==========

/**
 * Post engagement metrics
 */
export interface PostEngagement {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

/**
 * Comment engagement metrics
 */
export interface CommentEngagement {
  likesCount: number;
  isLiked: boolean;
}

/**
 * Comment data structure
 */
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string | null;
  likesCount: number;
  isLiked?: boolean; // Whether current user has liked this comment
  isAuthor?: boolean; // Whether this comment/reply is from the post author
  createdAt: string;
  updatedAt: string;
  editedAt?: string | null;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  replies?: Comment[]; // LinkedIn-style: Flat replies only, no nested replies
  commentMentions?: Mention[];
}

/**
 * Comment list response with pagination
 */
export interface CommentListResponse {
  success: boolean;
  data: Comment[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}

/**
 * Mention data structure
 */
export interface Mention {
  id: string;
  mentionedUserId: string;
  actorId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

/**
 * Connection/User for sending posts
 */
export interface Connection {
  id: string;
  name: string;
  username: string;
  profilePicture?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  headline?: string | null;
}

/**
 * Report reason enum
 */
export type ReportReason = 
  | "SPAM" 
  | "INAPPROPRIATE" 
  | "HARASSMENT" 
  | "HATE_SPEECH" 
  | "VIOLENCE" 
  | "SELF_HARM" 
  | "OTHER";

/**
 * Report data structure
 */
export interface Report {
  id: string;
  reporterId: string;
  targetType: "POST" | "COMMENT";
  targetId: string;
  reason: ReportReason;
  status: "OPEN" | "INVESTIGATING" | "CLOSED";
  createdAt: string;
}

/**
 * Like response
 */
export interface LikeResponse {
  success: boolean;
  message: string;
}

/**
 * Like status response
 */
export interface LikeStatusResponse {
  success: boolean;
  isLiked: boolean;
}

/**
 * Like count response
 */
export interface LikeCountResponse {
  success: boolean;
  count: number;
}

/**
 * Send post response
 */
export interface SendPostResponse {
  success: boolean;
  message: string;
  data: {
    sentTo: string[];
    message?: string;
  };
}

/**
 * Report response
 */
export interface ReportResponse {
  success: boolean;
  message: string;
  data: Report;
}

/**
 * Updated NewPost interface with engagement data
 */
export interface NewPostWithEngagement extends NewPost {
  engagement?: PostEngagement;
}

/**
 * Comment creation request
 */
export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

/**
 * Comment update request
 */
export interface UpdateCommentRequest {
  content: string;
}

/**
 * Send post request
 */
export interface SendPostRequest {
  recipientIds: string[];
  message?: string;
}

/**
 * Report request
 */
export interface ReportRequest {
  reason: ReportReason;
  metadata?: Record<string, any>;
}