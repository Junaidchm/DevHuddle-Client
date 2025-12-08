"use client";

import React, { useState, useRef, useEffect } from "react";
import { ImageTransform, Media, PhotoEditorModalProps, User, User as UserType } from "@/src/app/types/feed";
import EditorModal from "./EditorModal";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
import { ActionBar } from "./ActionBar";
import { ThumbnailGallery } from "./ThumbnailGallery";
import { EditPanel } from "./EditPanel";
import { MentionPanel } from "./MentionPanel";
import ErrorModal from "../../ui/ErrorModal";
import { useMedia } from "@/src/contexts/MediaContext";
import { default_ImageTransform, filters } from "@/src/constents/feed";
import { getImageStyle } from "@/lib/feed/getImageStyle";
import { useMediaUpload } from "@/src/hooks/useMediaUpload";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "@/src/services/api/user.service";

export default function PhotoEditorModal({
  isOpen,
  onClose,
}: PhotoEditorModalProps) {

  const {
    addMedia,
    media,
    setMedia,
    setTransform,
    setcurrentMediaId
  } = useMedia();

  // ✅ New Hook
  const {
    uploadFiles,
    isUploading,
    progress: uploadProgress,
    reset: resetMediaUploads
  } = useMediaUpload();

  const [selectedImages, setSelectedImages] = useState<Media[]>([]);
  const [rightPanelView, setRightPanelView] = useState<
    "default" | "edit" | "mention"
  >("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const updatedImages = (media ?? []).filter((file) => file.type.includes('image'));
    setSelectedImages(updatedImages);
  }, [media]);

  const { data: session } = useSession();

  // ✅ Fetch Users for Tagging
  const { data: users = [] } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: () =>
      searchUsers(searchQuery, {
        Authorization: `Bearer ${session?.user?.accessToken}`,
      }),
    enabled: rightPanelView === "mention",
  });

  const getCurrentImageTransform = (): ImageTransform => {
    const currentImage = selectedImages[currentImageIndex];
    const currentImageTransform =
      currentImage && currentImage.transform
        ? (currentImage.transform as ImageTransform)
        : default_ImageTransform;

    return currentImageTransform;
  };

  const updateImageTransform = (updates: Partial<ImageTransform>) => {
    const currentImage = selectedImages[currentImageIndex];
    if (currentImage) {
      setTransform(
        {
          ...getCurrentImageTransform(),
          ...updates,
        },
        currentImage.id
      );

      console.log("this is the updated transform data", currentImage);
    }
  };

  const removeImage = (imageId: string,fileName?:string) => {
    const newImages = selectedImages.filter((img) => img.id !== imageId);
    setMedia(newImages);
    
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...selectedImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setSelectedImages(newImages);
    setCurrentImageIndex(toIndex);
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
    setRightPanelView("default");
  };

  const applyTransforms = () => {
    setRightPanelView("default");
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ New Upload Handler
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check max files limit
    if (media.length + files.length > 5) {
       setError("Maximum 5 images allowed.");
       setTimeout(() => setError(null), 3000);
       return; 
    }

    const uploadedMedia = await uploadFiles(files);
    
    if (uploadedMedia.length > 0) {
      addMedia(uploadedMedia);
      
      // Select the first new image
      // Note: addMedia likely updates context async, so we use local result for immediate UI feedback if needed
      if (selectedImages.length === 0) {
        setcurrentMediaId(uploadedMedia[0].id);
        setCurrentImageIndex(0);
      }
    }
    
    resetInput();
  };

  if (!isOpen) return null;

  return (
    <EditorModal
      IconButtonAction={onClose}
      title="Photo Editor"
      ariaLabel="Close Photo modal"
    >
      <div className="flex-1 flex flex-col">
        {selectedImages.length > 0 ? (
          <ImagePreview
            image={selectedImages[currentImageIndex]?.url as string}
            taggedUsers={selectedImages[currentImageIndex]?.taggedUsers as User[]} 
            transform={getCurrentImageTransform()}
            getImageStyle={() =>
              getImageStyle(
                selectedImages[currentImageIndex].transform as ImageTransform
              )
            }
          />
        ) : (
          <ImageUploader
            onUpload={handleUpload}
            triggerUpload={triggerUpload}
            resetInput={resetInput}
            fileInputRef={fileInputRef}
            disabled = {isUploading || (media?.length || 0) >= 5}
          />
        )}
        <ActionBar
          onEdit={() => setRightPanelView("edit")}
          onTag={() => setRightPanelView("mention")}
          onDelete={() => {
            selectedImages.length > 0 &&
              removeImage(selectedImages[currentImageIndex].id);
          }}
          onAddMore={() => {
            resetInput();
            triggerUpload();
          }}
          imageCount={selectedImages.length}
          onDone={onClose}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
        />

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Pro tips:</span> Use the edit panel to
            enhance your photos, add alt text for accessibility, and tag people
            to increase engagement. You can reorder images by using the up/down
            arrows on thumbnails hello.
          </p>
        </div>
      </div>
      {rightPanelView === "default" && (
        <div className="w-32 overflow-y-auto">
          <ThumbnailGallery
            images={selectedImages}
            currentIndex={currentImageIndex}
            onSelect={setCurrentImageIndex}
            onRemove={removeImage}
            onMove={moveImage}
          />
        </div>
      )}
      {rightPanelView === "edit" && (
        <EditPanel
          transform={getCurrentImageTransform()}
          onTransformChange={updateImageTransform}
          onApply={() => setRightPanelView("default")}
          onClose={() => setRightPanelView("default")}
        />
      )}
      {rightPanelView === "mention" && (
        <MentionPanel
          users={users.map(u => ({
             id: u.id,
             name: u.name,
             avatar: u.profilePicture || "",
             title: ""
          }))}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          currentImageId={selectedImages[currentImageIndex]?.id}
          onClose={() => setRightPanelView("default")}
        />
      )}
      {error && <ErrorModal error={error} />}
    </EditorModal>
  );
}
