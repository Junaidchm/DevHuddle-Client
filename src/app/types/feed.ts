// export interface Post {
//   id: string;
//   content: string;
//   media?: ImageData[];
//   audience?: string;
//   commentControl?: string;
//   brandPartnership?: boolean;
//   timestamp?: Date;
//   author: User;
//   authorId: string;
//   authorName: string;
//   authorAvatar: string;
//   platform: string;
//   createdAt: string;
//   likes: number;
//   comments: number;
//   tags: string[];
// }

// export interface User {
//   id: string | number;
//   name: string;
//   title?: string;
//   avatar: string;
//   location?: string;
//   points?: number;
// }

// export interface ImageData {
//   id: number;
//   file: File;
//   preview: string;
//   name: string;
// }

// export interface ImageTransform {
//   rotation: number;
//   flipH: boolean;
//   flipV: boolean;
//   zoom: number;
//   straighten: number;
//   aspectRatio: string;
//   filter: string;
//   brightness: number;
//   contrast: number;
//   saturation: number;
//   temperature: number;
//   highlights: number;
//   shadows: number;
//   altText: string;
// }

// export interface FeedResponse {
//   posts: Post[];
//   nextCursor?: string;
// }


export interface Post {
  id: number;
  content: string;
  mediaUrl?: string;
  author: User;
  likes: number;
  comments: number;
  tags: string[];
  platform: string;
  timestamp: string;
}

export interface User {
  id: number;
  name: string;
  avatar: string;
  title?: string;
  points?: number;
}

export interface FeedResponse {
  posts: Post[];
  contributors: User[];
  nextCursor?: string;
}


export interface ImageData {
  id: string;
  file: File;
  preview: string;
  name: string;
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

export interface ActionBarProps {
  onEdit: () => void;
  onTag: () => void;
  onDuplicate: () => void;
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
  image: ImageData;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onRemove: (imageId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
}

export interface ThumbnailGalleryProps {
  images: ImageData[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onRemove: (imageId: string) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  className?: string;
}


export interface TaggedUsersListProps {
  taggedUsers: User[];
  onRemoveTag: (userId: number) => void;
  className?: string;
}

export type EditingTab = "crop" | "filter" | "adjust" ; 