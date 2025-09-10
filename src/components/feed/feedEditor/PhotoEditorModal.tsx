"use client";

import React, { useState, useRef, useEffect } from "react";
import { ImageTransform, Media, PhotoEditorModalProps, User as UserType } from "@/src/app/types/feed";
import EditorModal from "./EditorModal";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
import { ActionBar } from "./ActionBar";
import { ThumbnailGallery } from "./ThumbnailGallery";
import { EditPanel } from "./EditPanel";
import { MentionPanel } from "./MentionPanel";
import ErrorModal from "../../ui/ErrorModal";
import { useMedia } from "@/src/contexts/MediaContext";
import { handleImageUpload } from "@/lib/feed/handleImageUpload";
import { default_ImageTransform, filters } from "@/src/constents/feed";
import { getImageStyle } from "@/lib/feed/getImageStyle";



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

  const mockUsers: UserType[] = [
    {
      id: "1",
      name: "Junaid Chm",
      title: "Full Stack Developer",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: "2",
      name: "Anugrah James",
      title: "Founder & Software Developer",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: "3",
      name: "Akshara Raveendran",
      title: "Self-Learning Enthusiast",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: "4",
      name: "AKHIL MK",
      title: "Self Taught Developer",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  ];

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const removeImage = (imageId: string) => {
    const newImages = selectedImages.filter((img) => img.id !== imageId);
    setMedia(newImages);
    // setImageTransforms((prev) => {
    //   const newTransforms = { ...prev };
    //   delete newTransforms[imageId];
    //   return newTransforms;
    // });
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  // const duplicateImage = () => {
  //   const currentImage = selectedImages[currentImageIndex];

  //   if (currentImage) {
  //     const duplicatedImage = {
  //       ...currentImage,
  //       id: crypto.randomUUID(),
  //       name: `Copy of ${currentImage.name}`,
  //     };
  //     const newImages = [...selectedImages];
  //     newImages.splice(currentImageIndex + 1, 0, duplicatedImage);
  //     setSelectedImages(newImages);
  //     setImageTransforms((prev) => ({
  //       ...prev,
  //       [duplicatedImage.id]: { ...prev[currentImage.id] },
  //     }));
  //     setCurrentImageIndex(currentImageIndex + 1);
  //   }
  // };

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
  
  // const resetAllAdjustments = () => {
  //   updateImageTransform({
  //     brightness: 50,
  //     contrast: 50,
  //     saturation: 50,
  //     temperature: 50,
  //     highlights: 50,
  //     shadows: 50,
  //   });
  //   setBrightness(50);
  //   setContrast(50);
  //   setSaturation(50);
  //   setTemperature(50);
  //   setHighlights(50);
  //   setShadows(50);
  // };

  const triggerUpload = () => {
    console.log("input ref triggering ");
    fileInputRef.current?.click();
  };

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            taggedUsers={selectedImages[currentImageIndex]?.taggedUsers}
            transform={getCurrentImageTransform()}
            getImageStyle={() =>
              getImageStyle(
                selectedImages[currentImageIndex].transform as ImageTransform
              )
            }
          />
        ) : (
          <ImageUploader
            onUpload={(e) =>
              handleImageUpload(
                e,
                setError,
                addMedia,
                media,
                setCurrentImageIndex,
                setcurrentMediaId
              )
            }
            triggerUpload={triggerUpload}
            resetInput={resetInput}
            fileInputRef={fileInputRef}
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
            console.log("on upload more is working fine without any problem ");
            resetInput();
            triggerUpload();
          }}
          imageCount={selectedImages.length}
          onDone={onClose}
        />

        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Pro tips:</span> Use the edit panel to
            enhance your photos, add alt text for accessibility, and tag people
            to increase engagement. You can reorder images by using the up/down
            arrows on thumbnails.
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
          users={mockUsers}
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
