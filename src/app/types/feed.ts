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
}

export interface GradientButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  ariaLabel: string;
}

export interface ThumbnailProps {
  image: Media;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onRemove: (imageId: string) => void;
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
}

export interface submitPostProp {
  content:string; 
}

export interface NewPost {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user: { name: string; username?: string; avatar: string } | null;
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
