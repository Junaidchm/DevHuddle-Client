"use client";

import React, { useState, useRef, useEffect } from "react";
import { ImageTransform, Media, PhotoEditorModalProps, User } from "@/src/app/types/feed";
import EditorModal from "./EditorModal";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
import { ActionBar } from "./ActionBar";
import { ThumbnailGallery } from "./ThumbnailGallery";
import { EditPanel } from "./EditPanel";
import { MentionPanel } from "./MentionPanel";
import ErrorModal from "../../ui/ErrorModal";
import { default_ImageTransform } from "@/src/constents/feed";
import { getImageStyle } from "@/lib/feed/getImageStyle";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers, getMyConnections, SearchedUser } from "@/src/services/api/user.service";
import { usePostForm } from "@/src/hooks/feed/usePostForm";
import { queryKeys } from "@/src/lib/queryKeys";

export default function PhotoEditorModal({
  isOpen,
  onClose,
  initialImageId,
}: PhotoEditorModalProps & { initialImageId?: string }) {
  //  Use Centralized Context
  const {
    media: allMedia,
    addMedia,
    removeMedia,
    updateMediaItem,
    status: creationStatus,
    uploadProgress
  } = usePostForm();

  // Filter for images only and map to Media type
  const images = allMedia
    .filter((getItem) => getItem.type === "IMAGE")
    .map((item) => ({
      id: item.id,
      url: item.url,
      type: "image" as const,
      transform: item.transform,
      taggedUsers: item.taggedUsers,
      name: item.name || "image"
    }));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rightPanelView, setRightPanelView] = useState<
    "default" | "edit" | "mention"
  >("default");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure currentImageIndex is valid when images count changes or initialImageId is set
  useEffect(() => {
    if (images.length === 0) {
      setCurrentImageIndex(0);
    } else if (initialImageId) {
       const index = images.findIndex(img => img.id === initialImageId);
       if (index !== -1 && index !== currentImageIndex) {
           setCurrentImageIndex(index);
       }
    } else if (currentImageIndex >= images.length) {
      setCurrentImageIndex(images.length - 1);
    }
  }, [images.length, currentImageIndex, initialImageId]);

  const { data: session } = useSession();

  //  Fetch Users for Tagging (Search or Suggestions)
  const { data: users = [] } = useQuery({
    queryKey: searchQuery ? queryKeys.users.search(searchQuery) : queryKeys.users.connections,
    queryFn: async () => {
       const token = session?.user?.accessToken;
       if (!token) return [];
       const headers = { Authorization: `Bearer ${token}` };

       if (!searchQuery) {
         // Fetch connections (Direct from Auth Service)
         return getMyConnections(headers);
       } else {
         // Search users
         return searchUsers(searchQuery, headers);
       }
    },
    enabled: rightPanelView === "mention" && !!session?.user?.accessToken,
  });

  const getCurrentImage = () => images[currentImageIndex];

  const getCurrentImageTransform = (): ImageTransform => {
    const currentImage = getCurrentImage();
    return currentImage?.transform || default_ImageTransform;
  };

  const updateImageTransform = (updates: Partial<ImageTransform>) => {
    const currentImage = getCurrentImage();
    if (currentImage) {
      const newTransform = {
        ...getCurrentImageTransform(),
        ...updates,
        ...getCurrentImage().transform, // ensure we don't lose props? No, logic above was spread newTransform.
        ...updates
      } as ImageTransform;
      
      // Wait, original logic:
      /*
      const newTransform = {
        ...getCurrentImageTransform(),
        ...updates,
      };
      */
      
      updateMediaItem(currentImage.id, { transform: { ...getCurrentImageTransform(), ...updates } });
      console.log("Updated transform data", { ...getCurrentImageTransform(), ...updates });
    }
  };

  const handleRemoveImage = (imageId: string) => {
    removeMedia(imageId);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    console.warn("Reordering not yet supported in centralized state");
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > 5) {
       setError("Maximum 5 images allowed.");
       setTimeout(() => setError(null), 3000);
       return; 
    }

    await addMedia(files);
    resetInput();
  };

  if (!isOpen) return null;

  const currentImage = getCurrentImage();
  const isUploading = creationStatus === "UPLOADING";

  return (
    <EditorModal
      IconButtonAction={onClose}
      title="Photo Editor"
      ariaLabel="Close Photo modal"
    >
      <div className="flex-1 flex flex-col">
        {images.length > 0 ? (
          <ImagePreview
            image={currentImage?.url as string}
            taggedUsers={currentImage?.taggedUsers as User[]} 
            transform={getCurrentImageTransform()}
            getImageStyle={() =>
              getImageStyle(
                (currentImage?.transform || default_ImageTransform) as ImageTransform
              )
            }
          />
        ) : (
          <ImageUploader
            onUpload={handleUpload}
            triggerUpload={triggerUpload}
            resetInput={resetInput}
            fileInputRef={fileInputRef}
            disabled={isUploading || images.length >= 5}
          />
        )}
        <ActionBar
          onEdit={() => setRightPanelView("edit")}
          onTag={() => setRightPanelView("mention")}
          onDelete={() => {
            currentImage && handleRemoveImage(currentImage.id);
          }}
          onAddMore={() => {
            resetInput();
            triggerUpload();
          }}
          imageCount={images.length}
          onDone={onClose}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Pro tips:</span> Use the edit panel to
            enhance your photos, add alt text for accessibility, and tag people
            to increase engagement.
          </p>
        </div>
      </div>
      {rightPanelView === "default" && (
        <div className="w-32 overflow-y-auto">
          <ThumbnailGallery
            images={images}
            currentIndex={currentImageIndex}
            onSelect={setCurrentImageIndex}
            onRemove={handleRemoveImage}
            onMove={moveImage}
          />
        </div>
      )}
      {rightPanelView === "edit" && (
        <EditPanel
          transform={getCurrentImageTransform()}
          onTransformChange={(updates) => updateMediaItem(currentImage.id, { transform: { ...getCurrentImageTransform(), ...updates } })}
          onApply={() => setRightPanelView("default")}
          onClose={() => setRightPanelView("default")}
        />
      )}
      {rightPanelView === "mention" && (
        <MentionPanel
           users={users.map((u: SearchedUser) => ({
             id: u.id,
             name: u.name,
             avatar: u.profilePicture || u.avatar || "",
             title: u.headline || u.jobTitle || "" 
          }))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentImageId={currentImage?.id}
          taggedUsers={currentImage?.taggedUsers}
          onToggleTag={(user) => {
             if (!currentImage) return;
             const currentTags = currentImage.taggedUsers || [];
             const isTagged = currentTags.some(u => u.id === user.id);
             
             let newTags;
             if (isTagged) {
                newTags = currentTags.filter(u => u.id !== user.id);
             } else {
                newTags = [...currentTags, user];
             }
             
             updateMediaItem(currentImage.id, { taggedUsers: newTags });
          }}
          onClose={() => setRightPanelView("default")}
        />
      )}
      {error && <ErrorModal error={error} />}
    </EditorModal>
  );
}
