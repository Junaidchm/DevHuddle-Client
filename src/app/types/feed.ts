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