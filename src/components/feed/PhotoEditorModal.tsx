"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image,
  Edit3,
  User,
  Type,
  Trash2,
  Copy,
  Plus,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  Crop,
  Sliders,
  Palette,
} from "lucide-react";
import { ImageData, User as UserType } from "@/src/app/types/feed";
import AltTextModal from "./AlterTextModal";
import EditorModal from "./EditorModal";
import { ImageUploader } from "./ImageUploader";
import { ImagePreview } from "./ImagePreview";
import { ActionBar } from "./ActionBar";
import { GradientButton } from "../ui/GradientButton";
import { Thumbnail } from "./Thumbnail";
import { ThumbnailGallery } from "./ThumbnailGallery";
import { TaggedUsersList } from "./TaggedUsersList";
import { IconButton } from "./IconButton";
import { EditPanel } from "./EditPanel";
import { MentionPanel } from "./MentionPanel";

interface ImageTransform {
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

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  handleImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  selectedImages: ImageData[];
  setSelectedImages: React.Dispatch<React.SetStateAction<ImageData[]>>;
}

export default function PhotoEditorModal({
  isOpen,
  onClose,
  user,
  handleImageUpload,
  selectedImages,
  setSelectedImages,
}: PhotoEditorModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rightPanelView, setRightPanelView] = useState<
    "default" | "edit" | "mention"
  >("default");
  const [editTab, setEditTab] = useState<"crop" | "filter" | "adjust">("crop");
  const [searchQuery, setSearchQuery] = useState("");
  const [altText, setAltText] = useState("");
  const [showAltTextModal, setShowAltTextModal] = useState(false);
  const [taggedUsers, setTaggedUsers] = useState<UserType[]>([]);
  const [imageTransforms, setImageTransforms] = useState<
    Record<string, ImageTransform>
  >({});
  const [aspectRatio, setAspectRatio] = useState("original");
  const [zoom, setZoom] = useState(50);
  const [straighten, setStraighten] = useState(50);
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [brightness, setBrightness] = useState(50);
  const [contrast, setContrast] = useState(50);
  const [saturation, setSaturation] = useState(50);
  const [temperature, setTemperature] = useState(50);
  const [highlights, setHighlights] = useState(50);
  const [shadows, setShadows] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockUsers: UserType[] = [
    {
      id: 1,
      name: "Junaid Chm",
      title: "Full Stack Developer",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      name: "Anugrah James",
      title: "Founder & Software Developer",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: 3,
      name: "Akshara Raveendran",
      title: "Self-Learning Enthusiast",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: 4,
      name: "AKHIL MK",
      title: "Self Taught Developer",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  ];

  const filters = [
    { name: "None", value: "none", filter: "none" },
    {
      name: "Vintage",
      value: "vintage",
      filter: "sepia(0.5) contrast(1.2) brightness(1.1)",
    },
    { name: "B&W", value: "bw", filter: "grayscale(1) contrast(1.1)" },
    {
      name: "Warm",
      value: "warm",
      filter: "hue-rotate(15deg) saturate(1.2) brightness(1.1)",
    },
    {
      name: "Cool",
      value: "cool",
      filter: "hue-rotate(-15deg) saturate(1.1) brightness(0.9)",
    },
    {
      name: "Dramatic",
      value: "dramatic",
      filter: "contrast(1.5) saturate(1.3) brightness(0.9)",
    },
    {
      name: "Soft",
      value: "soft",
      filter: "blur(0.5px) brightness(1.1) saturate(0.8)",
    },
    {
      name: "Vibrant",
      value: "vibrant",
      filter: "saturate(1.5) contrast(1.2) brightness(1.1)",
    },
  ];

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const newTransforms = { ...imageTransforms };
    let hasChanges = false;

    selectedImages.forEach((image: any) => {
      if (!newTransforms[image.id]) {
        newTransforms[image.id] = {
          rotation: 0,
          flipH: false,
          flipV: false,
          zoom: 50,
          straighten: 50,
          aspectRatio: "original",
          filter: "none",
          brightness: 50,
          contrast: 50,
          saturation: 50,
          temperature: 50,
          highlights: 50,
          shadows: 50,
          altText: "",
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setImageTransforms(newTransforms);
    }
  }, [selectedImages]);

  useEffect(() => {
    const currentImage = selectedImages[currentImageIndex];
    if (currentImage && imageTransforms[currentImage.id]) {
      const transform = imageTransforms[currentImage.id];
      setZoom(transform.zoom);
      setStraighten(transform.straighten);
      setAspectRatio(transform.aspectRatio);
      setSelectedFilter(transform.filter);
      setBrightness(transform.brightness);
      setContrast(transform.contrast);
      setSaturation(transform.saturation);
      setTemperature(transform.temperature);
      setHighlights(transform.highlights);
      setShadows(transform.shadows);
      setAltText(transform.altText);
    }
  }, [currentImageIndex, selectedImages, imageTransforms]);

  const getCurrentImageTransform = (): ImageTransform => {
    const currentImage = selectedImages[currentImageIndex];
    return currentImage && imageTransforms[currentImage.id]
      ? imageTransforms[currentImage.id]
      : {
          rotation: 0,
          flipH: false,
          flipV: false,
          zoom: 50,
          straighten: 50,
          aspectRatio: "original",
          filter: "none",
          brightness: 50,
          contrast: 50,
          saturation: 50,
          temperature: 50,
          highlights: 50,
          shadows: 50,
          altText: "",
        };
  };

  const updateImageTransform = (updates: Partial<ImageTransform>) => {
    const currentImage = selectedImages[currentImageIndex];
    if (currentImage) {
      setImageTransforms((prev) => ({
        ...prev,
        [currentImage.id]: {
          ...prev[currentImage.id],
          ...updates,
        },
      }));
    }
  };

  const removeImage = (imageId: string) => {
    const newImages = selectedImages.filter((img) => img.id !== imageId);
    setSelectedImages(newImages);
    setImageTransforms((prev) => {
      const newTransforms = { ...prev };
      delete newTransforms[imageId];
      return newTransforms;
    });
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentImageIndex(0);
    }
  };

  const duplicateImage = () => {
    const currentImage = selectedImages[currentImageIndex];

    if (currentImage) {
      const duplicatedImage = {
        ...currentImage,
        id: crypto.randomUUID(),
        name: `Copy of ${currentImage.name}`,
      };
      const newImages = [...selectedImages];
      newImages.splice(currentImageIndex + 1, 0, duplicatedImage);
      setSelectedImages(newImages);
      setImageTransforms((prev) => ({
        ...prev,
        [duplicatedImage.id]: { ...prev[currentImage.id] },
      }));
      setCurrentImageIndex(currentImageIndex + 1);
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

  const addUserTag = (user: UserType) => {
    if (!taggedUsers.find((u) => u.id === user.id)) {
      setTaggedUsers((prev) => [...prev, user]);
    }
  };

  const removeUserTag = (userId: number) => {
    setTaggedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const getImageStyle = (): React.CSSProperties => {
    const transform = getCurrentImageTransform();
    const rotation = transform.rotation || 0;
    const flipH = transform.flipH ? -1 : 1;
    const flipV = transform.flipV ? -1 : 1;
    const zoomLevel = (transform.zoom / 50) * 0.5 + 0.75;
    const straightenAngle = ((transform.straighten - 50) / 50) * 15;
    let filterValue = "";
    if (transform.filter !== "none") {
      const filter = filters.find((f) => f.value === transform.filter);
      filterValue = filter ? filter.filter : "";
    }
    const brightnessVal = (transform.brightness / 50) * 0.5 + 0.75;
    const contrastVal = (transform.contrast / 50) * 0.5 + 0.75;
    const saturateVal = (transform.saturation / 50) * 0.5 + 0.75;
    const hueRotateVal = ((transform.temperature - 50) / 50) * 30;
    const adjustmentFilters = `brightness(${brightnessVal}) contrast(${contrastVal}) saturate(${saturateVal}) hue-rotate(${hueRotateVal}deg)`;

    return {
      transform: `rotate(${
        rotation + straightenAngle
      }deg) scale(${flipH}, ${flipV}) scale(${zoomLevel})`,
      filter: filterValue
        ? `${filterValue} ${adjustmentFilters}`
        : adjustmentFilters,
      transition: "all 0.3s ease",
    };
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
          //   <div className="relative flex-1 bg-gray-100 rounded-lg overflow-hidden">
          //     <div className="absolute inset-0 flex items-center justify-center">
          //       <img
          //         src={selectedImages[currentImageIndex]?.preview}
          //         alt={
          //           imageTransforms[selectedImages[currentImageIndex]?.id]
          //             ?.altText || "Selected"
          //         }
          //         className="max-w-full max-h-full object-contain rounded-lg"
          //         style={getImageStyle()}
          //       />
          //     </div>
          //     <div className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
          //       33
          //     </div>
          //     {taggedUsers.length > 0 && (
          //       <div className="absolute bottom-4 left-4 flex gap-2">
          //         {taggedUsers.map((user) => (
          //           <div
          //             key={user.id}
          //             className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-slate-800 shadow-lg"
          //           >
          //             @{user.name.split(" ")[0]}
          //           </div>
          //         ))}
          //       </div>
          //     )}
          //   </div>
          <ImagePreview
            image={selectedImages[currentImageIndex]?.preview}
            taggedUsers={taggedUsers}
            transform={getCurrentImageTransform()}
            getImageStyle={() => getImageStyle()}
          />
        ) : (
          <ImageUploader
            fileInputRef={fileInputRef}
            handleImageUpload={handleImageUpload}
          />
        )}
        <ActionBar
          onEdit={() => setRightPanelView("edit")}
          onTag={() => setRightPanelView("mention")}
          onDuplicate={duplicateImage}
          onDelete={() => {
            selectedImages.length > 0 &&
              removeImage(selectedImages[currentImageIndex].id);
          }}
          onAddMore={() => fileInputRef.current?.click()}
          imageCount={selectedImages.length}
          onDone={onClose}
        />
        {/* <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <div className="flex gap-3">
            <button
              onClick={() => setRightPanelView("edit")}
              className={`p-3 rounded-full transition-colors duration-200 ${
                rightPanelView === "edit"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 text-slate-600"
              }`}
              aria-label="Edit image"
            >
              <Edit3 size={20} />
            </button>
            <button
              onClick={() => setRightPanelView("mention")}
              className={`p-3 rounded-full transition-colors duration-200 ${
                rightPanelView === "mention"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 text-slate-600"
              }`}
              aria-label="Tag people"
            >
              <User size={20} />
            </button>
            <button
              onClick={() => {
                const currentImage = selectedImages[currentImageIndex];
                if (currentImage) {
                  const transform = getCurrentImageTransform();
                  setAltText(transform.altText || "");
                  setShowAltTextModal(true);
                }
              }}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200"
              disabled={selectedImages.length === 0}
              aria-label="Add alt text"
            >
              <Type size={20} className="text-slate-600" />
            </button>
            <button
              onClick={duplicateImage}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200"
              disabled={selectedImages.length === 0}
              aria-label="Duplicate image"
            >
              <Copy size={20} className="text-slate-600" />
            </button>
            <button
              onClick={() =>
                selectedImages.length > 0 &&
                removeImage(selectedImages[currentImageIndex].id)
              }
              className="p-3 hover:bg-red-100 rounded-full transition-colors duration-200"
              disabled={selectedImages.length === 0}
              aria-label="Delete image"
            >
              <Trash2 size={20} className="text-red-500" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Add more images"
            >
              <Plus size={20} className="text-slate-600" />
            </button>
          </div>
         
          <button
            onClick={onClose}
            className="bg-gradient-to-br from-violet-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            disabled={selectedImages.length === 0}
            aria-label={`Done editing, ${selectedImages.length} images`}
          >
            Done ({selectedImages.length})
          </button>
        </div> */}
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
          {taggedUsers.length > 0 && (
            // <div className="mt-6 pt-4 border-t border-slate-200">
            //   <h4 className="text-sm font-medium text-slate-700 mb-3">
            //     Tagged
            //   </h4>
            //   <div className="space-y-2">
            //     {taggedUsers.map((user) => (
            //       <div
            //         key={user.id}
            //         className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
            //       >
            //         <img
            //           src={user.avatar}
            //           alt={`${user.name}'s avatar`}
            //           className="w-6 h-6 rounded-full"
            //         />
            //         <span className="text-xs text-slate-700 flex-1 truncate">
            //           {user.name}
            //         </span>
            //         <button
            //           onClick={() => removeUserTag(user.id)}
            //           className="text-red-500 hover:text-red-700 text-xs"
            //           aria-label={`Remove tag ${user.name}`}
            //         >
            //           ×
            //         </button>
            //       </div>
            //     ))}
            //   </div>
            // </div>
            <TaggedUsersList
              onRemoveTag={removeUserTag}
              taggedUsers={taggedUsers}
            />
          )}
        </div>
      )}
      {rightPanelView === "edit" && (
        // <div className="w-96 border-l border-slate-200 pl-6">
        //   <div className="flex items-center gap-3 mb-6">
        //     {/* <button
        //       onClick={() => setRightPanelView("default")}
        //       className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        //       aria-label="Close edit panel"
        //     >
        //       <X size={20} className="text-slate-600" />
        //     </button> */}
        //     <IconButton
        //       onClick={()=> setRightPanelView("default")}
        //       icon={<X size={20} className="text-slate-600" />}
        //       ariaLabel="Close edit panel"
        //     />
        //     <h3 className="text-lg font-semibold text-slate-800">Edit</h3>
        //   </div>
        //   <div className="flex border-b border-slate-200 mb-6">
        //     <button
        //       onClick={() => setEditTab("crop")}
        //       className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        //         editTab === "crop"
        //           ? "text-slate-800 border-blue-500"
        //           : "text-slate-500 border-transparent hover:text-slate-700"
        //       }`}
        //       aria-label="Crop tab"
        //     >
        //       <Crop size={16} className="inline mr-2" />
        //       Crop
        //     </button>
        //     <button
        //       onClick={() => setEditTab("filter")}
        //       className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        //         editTab === "filter"
        //           ? "text-slate-800 border-blue-500"
        //           : "text-slate-500 border-transparent hover:text-slate-700"
        //       }`}
        //       aria-label="Filter tab"
        //     >
        //       <Palette size={16} className="inline mr-2" />
        //       Filter
        //     </button>
        //     <button
        //       onClick={() => setEditTab("adjust")}
        //       className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        //         editTab === "adjust"
        //           ? "text-slate-800 border-blue-500"
        //           : "text-slate-500 border-transparent hover:text-slate-700"
        //       }`}
        //       aria-label="Adjust tab"
        //     >
        //       <Sliders size={16} className="inline mr-2" />
        //       Adjust
        //     </button>
        //   </div>
        //   <div className="max-h-[400px] overflow-y-auto pr-2">
        //     {editTab === "crop" && (
        //       <div className="space-y-6">
        //         <div className="flex gap-2">
        //           <button
        //             onClick={() =>
        //               updateImageTransform({
        //                 rotation:
        //                   (getCurrentImageTransform().rotation || 0) - 90,
        //               })
        //             }
        //             className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
        //             aria-label="Rotate left"
        //           >
        //             <RotateCcw size={20} className="text-slate-600" />
        //           </button>
        //           <button
        //             onClick={() =>
        //               updateImageTransform({
        //                 rotation:
        //                   (getCurrentImageTransform().rotation || 0) + 90,
        //               })
        //             }
        //             className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
        //             aria-label="Rotate right"
        //           >
        //             <RotateCw size={20} className="text-slate-600" />
        //           </button>
        //           <button
        //             onClick={() =>
        //               updateImageTransform({
        //                 flipH: !getCurrentImageTransform().flipH,
        //               })
        //             }
        //             className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
        //             aria-label="Flip horizontal"
        //           >
        //             <FlipHorizontal size={20} className="text-slate-600" />
        //           </button>
        //           <button
        //             onClick={() =>
        //               updateImageTransform({
        //                 flipV: !getCurrentImageTransform().flipV,
        //               })
        //             }
        //             className="p-3 hover:bg-gray-100 rounded-lg border border-slate-200 transition-colors"
        //             aria-label="Flip vertical"
        //           >
        //             <svg
        //               width="20"
        //               height="20"
        //               viewBox="0 0 24 24"
        //               fill="none"
        //               stroke="currentColor"
        //               strokeWidth="2"
        //               className="text-slate-600"
        //             >
        //               <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        //               <line x1="12" y1="8" x2="12" y2="16" />
        //               <polyline points="8,12 12,8 16,12" />
        //             </svg>
        //           </button>
        //         </div>
        //         <div>
        //           <h4 className="text-sm font-medium text-slate-700 mb-3">
        //             Aspect Ratio
        //           </h4>
        //           <div className="flex flex-wrap gap-2">
        //             {["Original", "Square", "4:3", "3:4", "16:9", "9:16"].map(
        //               (ratio) => (
        //                 <button
        //                   key={ratio}
        //                   onClick={() => {
        //                     setAspectRatio(ratio.toLowerCase());
        //                     updateImageTransform({
        //                       aspectRatio: ratio.toLowerCase(),
        //                     });
        //                   }}
        //                   className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
        //                     aspectRatio === ratio.toLowerCase()
        //                       ? "bg-green-500 text-white"
        //                       : "bg-gray-100 text-slate-700 hover:bg-gray-200"
        //                   }`}
        //                   aria-label={`Set aspect ratio to ${ratio}`}
        //                 >
        //                   {ratio}
        //                 </button>
        //               )
        //             )}
        //           </div>
        //         </div>
        //         <div>
        //           <h4 className="text-sm font-medium text-slate-700 mb-3">
        //             Zoom ({Math.round((zoom / 50) * 50 + 75)}%)
        //           </h4>
        //           <div className="relative">
        //             <input
        //               type="range"
        //               min="0"
        //               max="100"
        //               value={zoom}
        //               onChange={(e) => {
        //                 const value = Number(e.target.value);
        //                 setZoom(value);
        //                 updateImageTransform({ zoom: value });
        //               }}
        //               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        //               aria-label="Adjust zoom"
        //             />
        //           </div>
        //         </div>
        //         <div>
        //           <h4 className="text-sm font-medium text-slate-700 mb-3">
        //             Straighten ({Math.round(((straighten - 50) / 50) * 15)}%)
        //           </h4>
        //           <div className="relative">
        //             <input
        //               type="range"
        //               min="0"
        //               max="100"
        //               value={straighten}
        //               onChange={(e) => {
        //                 const value = Number(e.target.value);
        //                 setStraighten(value);
        //                 updateImageTransform({ straighten: value });
        //               }}
        //               className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        //               aria-label="Adjust straighten"
        //             />
        //           </div>
        //         </div>
        //       </div>
        //     )}
        //     {editTab === "filter" && (
        //       <div className="space-y-4">
        //         <div className="grid grid-cols-2 gap-3">
        //           {filters.map((filter) => (
        //             <button
        //               key={filter.value}
        //               onClick={() => {
        //                 console.log('the filter setting is working......', )
        //                 setSelectedFilter(filter.value);
        //                 updateImageTransform({ filter: filter.value });
        //               }}
        //               className={`relative p-3 rounded-lg border-2 text-center transition-all ${
        //                 selectedFilter === filter.value
        //                   ? "border-blue-500 bg-blue-50"
        //                   : "border-gray-200 hover:border-gray-300"
        //               }`}
        //               aria-label={`Apply ${filter.name} filter`}
        //             >
        //               <div className="text-sm font-medium text-slate-700">
        //                 {filter.name}
        //               </div>
        //               <div
        //                 className="w-full h-12 bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 rounded mt-2"
        //                 style={{ filter: filter.filter }}
        //               />
        //             </button>
        //           ))}
        //         </div>
        //       </div>
        //     )}
        //     {editTab === "adjust" && (
        //       <div className="space-y-5">
        //         <div>
        //           <div className="flex justify-between items-center mb-2">
        //             <h4 className="text-sm font-medium text-slate-700">
        //               Brightness
        //             </h4>
        //             <span className="text-xs text-slate-500">
        //               {Math.round((brightness / 50) * 50 + 75)}%
        //             </span>
        //           </div>
        //           <input
        //             type="range"
        //             min="0"
        //             max="100"
        //             value={brightness}
        //             onChange={(e) => {
        //               const value = Number(e.target.value);
        //               setBrightness(value);
        //               updateImageTransform({ brightness: value });
        //             }}
        //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        //             aria-label="Adjust brightness"
        //           />
        //         </div>
        //         <div>
        //           <div className="flex justify-between items-center mb-2">
        //             <h4 className="text-sm font-medium text-slate-700">
        //               Contrast
        //             </h4>
        //             <span className="text-xs text-slate-500">
        //               {Math.round((contrast / 50) * 50 + 75)}%
        //             </span>
        //           </div>
        //           <input
        //             type="range"
        //             min="0"
        //             max="100"
        //             value={contrast}
        //             onChange={(e) => {
        //               const value = Number(e.target.value);
        //               setContrast(value);
        //               updateImageTransform({ contrast: value });
        //             }}
        //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        //             aria-label="Adjust contrast"
        //           />
        //         </div>
        //         <div>
        //           <div className="flex justify-between items-center mb-2">
        //             <h4 className="text-sm font-medium text-slate-700">
        //               Saturation
        //             </h4>
        //             <span className="text-xs text-slate-500">
        //               {Math.round((saturation / 50) * 50 + 75)}%
        //             </span>
        //           </div>
        //           <input
        //             type="range"
        //             min="0"
        //             max="100"
        //             value={saturation}
        //             onChange={(e) => {
        //               const value = Number(e.target.value);
        //               setSaturation(value);
        //               updateImageTransform({ saturation: value });
        //             }}
        //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        //             aria-label="Adjust saturation"
        //           />
        //         </div>
        //         <div>
        //           <div className="flex justify-between items-center mb-2">
        //             <h4 className="text-sm font-medium text-slate-700">
        //               Temperature
        //             </h4>
        //             <span className="text-xs text-slate-500">
        //               {Math.round(((temperature - 50) / 50) * 30)}°
        //             </span>
        //           </div>
        //           <input
        //             type="range"
        //             min="0"
        //             max="100"
        //             value={temperature}
        //             onChange={(e) => {
        //               const value = Number(e.target.value);
        //               setTemperature(value);
        //               updateImageTransform({ temperature: value });
        //             }}
        //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        //             aria-label="Adjust temperature"
        //           />
        //         </div>
        //         <div>
        //           <div className="flex justify-between items-center mb-2">
        //             <h4 className="text-sm font-medium text-slate-700">
        //               Highlights
        //             </h4>
        //             <span className="text-xs text-slate-500">
        //               {Math.round((highlights / 50) * 50 + 75)}%
        //             </span>
        //           </div>
        //           <input
        //             type="range"
        //             min="0"
        //             max="100"
        //             value={highlights}
        //             onChange={(e) => {
        //               const value = Number(e.target.value);
        //               setHighlights(value);
        //               updateImageTransform({ highlights: value });
        //             }}
        //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        //             aria-label="Adjust highlights"
        //           />
        //         </div>
        //         <div>
        //           <div className="flex justify-between items-center mb-2">
        //             <h4 className="text-sm font-medium text-slate-700">
        //               Shadows
        //             </h4>
        //             <span className="text-xs text-slate-500">
        //               {Math.round((shadows / 50) * 50 + 75)}%
        //             </span>
        //           </div>
        //           <input
        //             type="range"
        //             min="0"
        //             max="100"
        //             value={shadows}
        //             onChange={(e) => {
        //               const value = Number(e.target.value);
        //               setShadows(value);
        //               updateImageTransform({ shadows: value });
        //             }}
        //             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        //             aria-label="Adjust shadows"
        //           />
        //         </div>
        //         <div className="flex justify-between mt-6">
        //           <button
        //             onClick={resetAllAdjustments}
        //             className="px-4 py-2 text-sm font-medium text-red-500 border border-red-500 rounded-full hover:bg-red-50 transition-colors"
        //             aria-label="Reset all adjustments"
        //           >
        //             Reset All
        //           </button>
        //           <button
        //             onClick={applyTransforms}
        //             className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-violet-500 to-purple-600 rounded-full hover:-translate-y-0.5 hover:shadow-lg transition-all"
        //             aria-label="Apply adjustments"
        //           >
        //             Apply
        //           </button>
        //         </div>
        //       </div>
        //     )}
        //   </div>
        // </div>
        <EditPanel
          transform={getCurrentImageTransform()}
          onTransformChange={updateImageTransform}
          onApply={() => setRightPanelView("default")}
          onClose={() => setRightPanelView("default")}
        />
      )}
      {rightPanelView === "mention" && (
        // <div className="w-96 border-l border-slate-200 pl-6 flex flex-col h-full">
        //   {/* Top part: Title and Search */}
        //   <div>
        //     <div className="flex items-center gap-3 mb-6">
        //       <button
        //         onClick={() => setRightPanelView("default")}
        //         className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        //         aria-label="Close mention panel"
        //       >
        //         <X size={20} className="text-slate-600" />
        //       </button>
        //       <h3 className="text-lg font-semibold text-slate-800">
        //         Tag People
        //       </h3>
        //     </div>
        //     <div className="mb-6">
        //       <input
        //         type="text"
        //         value={searchQuery}
        //         onChange={(e) => setSearchQuery(e.target.value)}
        //         placeholder="Search for people..."
        //         className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        //         aria-label="Search users to tag"
        //       />
        //     </div>
        //   </div>

        //   {/* User Search Results (This part should grow and shrink) */}
        //   <div className="flex-grow overflow-y-auto pr-2">
        //     {filteredUsers.length > 0 ? (
        //       filteredUsers.map((user) => (
        //         <div
        //           key={user.id}
        //           className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        //           onClick={() => addUserTag(user)}
        //           aria-label={`Tag ${user.name}`}
        //         >
        //           <img
        //             src={user.avatar}
        //             alt={`${user.name}'s avatar`}
        //             className="w-10 h-10 rounded-full"
        //           />
        //           <div>
        //             <div className="text-sm font-medium text-slate-700">
        //               {user.name}
        //             </div>
        //             <div className="text-xs text-slate-500">{user.title}</div>
        //           </div>
        //         </div>
        //       ))
        //     ) : (
        //       <p className="text-sm text-slate-500">No users found</p>
        //     )}
        //   </div>

        //   {/* Tagged Users List (This part is fixed at the bottom and scrolls) */}
        //   <div className="mt-auto pt-4 border-t border-slate-200">
        //     <h4 className="text-sm font-medium text-slate-700 mb-3">
        //       Tagged Users
        //     </h4>
        //     {/* --- FIX: Add a wrapping div with height and overflow classes --- */}
        //     <div className="max-h-[160px] overflow-y-auto pr-2 space-y-2">
        //       {taggedUsers.length > 0 ? (
        //         taggedUsers.map((user) => (
        //           <div
        //             key={user.id}
        //             className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
        //           >
        //             <img
        //               src={user.avatar}
        //               alt={`${user.name}'s avatar`}
        //               className="w-6 h-6 rounded-full"
        //             />
        //             <span className="text-xs text-slate-700 flex-1 truncate">
        //               {user.name}
        //             </span>
        //             <button
        //               onClick={() => removeUserTag(user.id)}
        //               className="text-red-500 hover:text-red-700 text-xs"
        //               aria-label={`Remove tag ${user.name}`}
        //             >
        //               ×
        //             </button>
        //           </div>
        //         ))
        //       ) : (
        //         <p className="text-sm text-slate-500">No users tagged</p>
        //       )}
        //     </div>
        //   </div>
        // </div>
        <MentionPanel
          users={mockUsers}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddTag={addUserTag}
          taggedUsers={taggedUsers}
          onRemoveTag={removeUserTag}
          onClose={() => setRightPanelView("default")}
        />
      )}
    </EditorModal>
  );
}
