import { getPresignedUrl } from "./getPresignedUrl";
import { uploadToS3 } from "./uploadToS3WithProgressTracking";

// Helper to upload multiple files in parallel with progress tracking
export const uploadMultipleToS3 = async (
  files: { file: File; id: number }[],
  onProgress: (id: number, progress: number) => void,
  signal?: AbortSignal
): Promise<{ id: number; url: string; key: string }[]> => {
  return Promise.all(
    files.map(async ({ file, id }) => {
      const { url: presignedUrl, key } = await getPresignedUrl(
        "feed",
        "PUT",
        file.name,
        file.type
      );
      const uploadedUrl = await uploadToS3(
        file,
        presignedUrl,
        (progress) => onProgress(id, progress),
        signal
      );
      return { id, url: uploadedUrl, key };
    })
  );
};
