
import axios from "axios";
import { retry } from "./retry";

export const uploadToS3 = async (
  file: File,
  presignedUrl: string,
  onProgress: (progress: number) => void,
  signal?: AbortSignal
): Promise<string> => {
  try {
    const response = await retry(() =>
      axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentComplete = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentComplete);
          }
        },
        signal, // Allow cancellation
      })
    );
    return presignedUrl.split('?')[0]; // Return S3 object URL
  } catch (err: any) {
    if (axios.isCancel(err)) {
      throw new Error('Upload cancelled');
    }
    console.error('Upload error:', err);
    throw new Error('Failed to upload to S3');
  }
};
