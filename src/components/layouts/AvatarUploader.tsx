// 
"use client";

import React, { useCallback, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { Dialog } from "@headlessui/react";
import getCroppedImg from "@/src/utils/cropImage";
import toast from "react-hot-toast";
import { Button } from "@/src/app/(app)/profile/update/[username]/components";

interface AvatarUploaderProps {
  onImageCropped: (file: File, previewUrl: string) => void;
  value?: File;
  previewUrl?: string | null;
  PROFILE_DEFAULT_URL?: string;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onImageCropped, previewUrl, PROFILE_DEFAULT_URL }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Added to ensure no form submission
    const file = e.target.files?.[0];
    if (file && file.size <= 1024 * 1024) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageSrc(reader.result as string));
      reader.readAsDataURL(file);
      setIsCropping(true);
    } else {
      toast.error("Please upload image under 1MB", { position: "top-center" });
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    const { file, url } = await getCroppedImg(imageSrc, croppedAreaPixels);
    onImageCropped(file, url);
    setIsCropping(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Avatar"
          className="w-[100px] h-[100px] rounded-full object-cover border-4 border-gray-200"
        />
      ) : (
        <img
          src={PROFILE_DEFAULT_URL}
          alt="Default Avatar"
          className="w-[100px] h-[100px] rounded-full object-cover border-4 border-gray-200"
        />
      )}

      <Button
        text="Upload New Picture"
        variant="secondary"
        icon="fas fa-upload"
        type="button" // Added to prevent form submission
        onClick={() => inputRef.current?.click()}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
      />
      <p className="text-sm text-gray-500">JPG, PNG or GIF. 1MB max size.</p>

      <Dialog open={isCropping} onClose={() => setIsCropping(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90vw] max-w-md">
            <h3 className="text-lg font-semibold mb-4">Crop your avatar</h3>
            <div className="relative w-full h-64 bg-gray-100">
              <Cropper
                image={imageSrc!}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4 flex justify-between">
              <Button text="Cancel" variant="secondary" onClick={() => setIsCropping(false)} />
              <Button text="Save" variant="primary" onClick={handleCropSave} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default AvatarUploader;