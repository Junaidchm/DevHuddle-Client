"use client";

import { createContext, ReactNode, useContext, useState } from "react";
import { ImageTransform, Media, User } from "../app/types/feed";

export enum PostType {
  TEXT = "TEXT",
  ARTICLE = "ARTICLE",
  POLL = "POLL",
}

export enum AudienceType {
  PUBLIC = "PUBLIC",
  CONNECTIONS = "VISIBILITY_CONNECTIONS",
}

export enum CommentControl {
 ANYONE =  "ANYONE" ,
 CONNECTIONS= "CONNECTIONS" ,
 NOBODY = "NOBODY"
}

interface MediaContextType {
  type: PostType;
  settingPostType: (
    postType: PostType
  ) => void;
  audienceType: AudienceType;
  settingAudienceType: (
    value: AudienceType
  ) => void;
  commentControl:CommentControl;
  settingCommentControl:(value:CommentControl)=> void;
  media: Media[];
  addMedia: (media: Media[]) => void;
  setMedia: (media: Media[]) => void;
  clearMedia: () => void;
  currentMediaId: string;
  setcurrentMediaId: (mediaId: string) => void;
  setTransform: (transform: ImageTransform, id: string) => void;
  setTaggedUsers: (taggedUsers: User, fileId: string) => void;
  removeTaggedUser: (mediaId: string, userId: string) => void;
}

export const MediaContext = createContext<MediaContextType | undefined>(
  undefined
);

export const MediaProvider = ({ children }: { children: ReactNode }) => {
  const [media, setMediaState] = useState<Media[]>([]);
  const [currentMediaId, setMediaId] = useState<string>("");
  const [type, setPostType] = useState<PostType>(PostType.TEXT);
  const [audienceType, setAudienceType] = useState<AudienceType>(
    AudienceType.PUBLIC
  );
  const [commentControl, setCommentControl] = useState<CommentControl>(CommentControl.ANYONE);

  const settingAudienceType=(value:AudienceType)=> {
     setAudienceType(value)
  }

  const settingCommentControl = (value:CommentControl)=> {
    setCommentControl(value)
  }

  const settingPostType = (postType: PostType) => {
    setPostType(postType);
  };

  const addMedia = (media: Media[]) => {
    setMediaState((pre) => {
      // ✅ FIX: Merge by mediaId/URL to avoid duplicates and preserve existing media
      const existingMediaIds = new Set(pre.map((m) => m.mediaId).filter(Boolean));
      const existingUrls = new Set(pre.map((m) => m.url).filter(Boolean));
      
      const newMedia = media.filter((m) => {
        // Skip if already exists by mediaId
        if (m.mediaId && existingMediaIds.has(m.mediaId)) {
          return false;
        }
        // Skip if already exists by URL
        if (m.url && existingUrls.has(m.url)) {
          return false;
        }
        return true;
      });

      // ✅ FIX: If media with same URL exists but no mediaId, update it with the new mediaId
      const updatedMedia = pre.map((existing) => {
        const matchingNew = media.find((m) => m.url === existing.url && !existing.mediaId && m.mediaId);
        if (matchingNew) {
          return { ...existing, mediaId: matchingNew.mediaId };
        }
        return existing;
      });

      return [...updatedMedia, ...newMedia];
    });
  };

  const setMedia = (newMedia: Media[]) => {
    setMediaState(newMedia);
    // ✅ FIXED P0-11: Removed console.log from production code
  };

  const clearMedia = () => {
    setMediaState([]);
  };

  const setcurrentMediaId = (mediaId: string) => {
    setMediaId(mediaId);
  };

  const setTransform = (transform: ImageTransform, id: string) => {
    setMediaState((pre) => {
      const updatedMedia = pre.map((file) =>
        file.id === id ? { ...file, transform: transform } : file
      );
      return updatedMedia;
    });
  };

  const setTaggedUsers = (taggedUser: User, fileId: string) => {
    setMediaState((pre) => {
      return pre.map((file) => {
        if (file.id !== fileId) return file;

        if (file.taggedUsers && file.taggedUsers.length > 0) {
          if (file.taggedUsers.some((u) => u.id === taggedUser.id)) {
            return file;
          }
          return {
            ...file,
            taggedUsers: [...file.taggedUsers, taggedUser],
          };
        }

        return file;
      });
    });
  };

  const removeTaggedUser = (filedId: string, userId: string) => {
    setMediaState((pre) =>
      pre.map((file) => {
        if (file.id !== filedId) return file;

        if (file.taggedUsers && file.taggedUsers.length > 0) {
          const updateTaggedUsers = file.taggedUsers.filter(
            (user) => user.id !== userId
          );

          return {
            ...file,
            taggedUsers: updateTaggedUsers,
          };
        }
        return file;
      })
    );
  };

  return (
    <MediaContext.Provider
      value={{
        type,
        settingPostType,
        audienceType,
        settingAudienceType,
        commentControl,
        settingCommentControl,
        media,
        addMedia,
        clearMedia,
        setMedia,
        currentMediaId,
        setTransform,
        setTaggedUsers,
        removeTaggedUser,
        setcurrentMediaId,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
};
