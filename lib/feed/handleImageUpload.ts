// import { Media } from "@/src/app/types/feed";
// import { default_ImageTransform } from "@/src/constents/feed";

// export const handleImageUpload = async (
//   event: React.ChangeEvent<HTMLInputElement>,
//   setError: React.Dispatch<React.SetStateAction<string | null>>,
//   addMedia: (media: Media[]) => void,
//   selectedMedia: Media[],
//   setCurrentImageIndex: (index: number) => void,
//   setCurrentMediaId: (mediaId: string) => void,
//   onFilesSelected: (files: File[]) => void
// ): Promise<void> => {
//   const files = Array.from(event.target.files || []);
//   if (files.length + selectedMedia.length > 5) {
//     setError("Maximum 5 images allowed.");
//     setTimeout(() => setError(null), 3000);
//     return;
//   }

//   const validFiles = files.filter((file) => {
//     const isValidType = ["image/jpeg", "image/png", "image/gif"].includes(
//       file.type
//     );
//     const isValidSize = file.size <= 1 * 1024 * 1024; // 1MB limit
//     if (!isValidType) {
//       setError(`File ${file.name} is not a supported image type.`);
//     }
//     if (!isValidSize) {
//       setError(`File ${file.name} exceeds 10MB size limit.`);
//     }
//     return isValidSize && isValidType;
//   });

//    onFilesSelected(files)
//    event.target.value = ""

//   if (validFiles.length === 0) {
//     setTimeout(() => setError(null), 3000);
//     return;
//   }

//   try {
//     const images = await Promise.all(
//       validFiles.map(async (file, index) => {
//         const reader = new FileReader();
//         return new Promise<Media>((resolve, reject) => {
//           reader.onload = (e) => {
//             if (e.target?.result) {
//               resolve({
//                 id: crypto.randomUUID(),
//                 file,
//                 url: e.target.result as string,
//                 name: file.name,
//                 taggedUsers: [],
//                 transform: default_ImageTransform,
//                 type: file.type,
//               });
//             } else {
//               reject(new Error(`Failed to read file: ${file.name}`));
//             }
//           };
//           reader.onerror = () =>
//             reject(new Error(`Error reading file: ${file.name}`));
//           reader.readAsDataURL(file);
//         });
//       })
//     );

//     addMedia(images);

//     if (selectedMedia.length === 0 && images.length > 0) {
//       setCurrentImageIndex(0);
//       setCurrentMediaId(images[0].id);
//     }

//     console.log("this is the selected media : ", selectedMedia);

//     // return mediaImages;
//   } catch (error) {
//     setError("Error processing images.");
//     setTimeout(() => setError(null), 3000);
//   }
// };

export interface Attachment {
  file: File;
  mediaId?: string;
  isUploading: boolean;
}

import { Media } from "@/src/app/types/feed";
import { default_ImageTransform } from "@/src/constents/feed";

export const handleImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  addMedia: (media: Media[]) => void,
  selectedMedia: Media[],
  setCurrentImageIndex: (index: number) => void,
  setCurrentMediaId: (mediaId: string) => void,
  startUpload: (files: File[]) => void,
  attachments: Attachment[]
): Promise<void> => {
  const files = Array.from(event.target.files || []);
  if (files.length + selectedMedia.length > 5) {
    setError("Maximum 5 images allowed.");
    setTimeout(() => setError(null), 3000);
    return;
  }

  const validFiles = files.filter((file) => {
    const isValidType = ["image/jpeg", "image/png", "image/gif"].includes(
      file.type
    );
    const isValidSize = file.size <= 1 * 1024 * 1024; // 1MB limit
    if (!isValidType) {
      setError(`File ${file.name} is not a supported image type.`);
    }
    if (!isValidSize) {
      setError(`File ${file.name} exceeds 10MB size limit.`);
    }
    return isValidSize && isValidType;
  });

  startUpload(files);
  event.target.value = "";

  // if (validFiles.length === 0) {
  //   setTimeout(() => setError(null), 3000);
  //   return;
  // }

  try {
    // const images = await Promise.all(
    //   attachments.map(async ({ file }, index) => {
    //     return new Promise<Media>((resolve, reject) => {
    //       resolve({
    //         id: crypto.randomUUID(),
    //         file,
    //         url: URL.createObjectURL(file),
    //         name: file.name,
    //         taggedUsers: [],
    //         transform: default_ImageTransform,
    //         type: file.type,
    //       });
    //     });
    //   })
    // );

    // addMedia(images);

    // if (selectedMedia.length === 0 && images.length > 0) {
    //   setCurrentImageIndex(0);
    //   setCurrentMediaId(images[0].id);
    // }

    // console.log("this is the selected media : ", selectedMedia);

    // return mediaImages;
  } catch (error) {
    setError("Error processing images.");
    setTimeout(() => setError(null), 3000);
  }
};
