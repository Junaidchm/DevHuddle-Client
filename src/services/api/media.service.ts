import { axiosInstance } from "@/src/axios/axios";
import { API_ROUTES } from "@/src/constants/api.routes";

export type MediaType = 
  | "POST_IMAGE" 
  | "POST_VIDEO" 
  | "PROFILE_IMAGE"
  | "CHAT_IMAGE"
  | "CHAT_VIDEO"
  | "CHAT_AUDIO"
  | "CHAT_FILE"
  | "COVER_IMAGE";

export interface UploadSessionRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  mediaType: MediaType;
}

export interface UploadSessionResponse {
  mediaId: string;
  uploadUrl: string;
  storageKey: string;
  expiresAt: number;
  useMultipart?: boolean;
  uploadId?: string;
  partSize?: number;
  totalParts?: number;
}

export interface CompleteUploadResponse {
  mediaId: string;
  cdnUrl: string;
  status: string;
}

export interface MediaInfo {
  id: string;
  userId: string;
  postId?: string;
  mediaType: MediaType;
  storageKey: string;
  cdnUrl: string;
  originalUrl: string;
  fileName: string;
  fileSize: bigint | number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  status: string;
  metadata?: any;
  thumbnailUrls?: any;
  transcodedUrls?: any;
  hlsUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request upload session (presigned URL)
 */
export const createUploadSession = async (
  data: UploadSessionRequest,
  headers: Record<string, string>
): Promise<UploadSessionResponse> => {
  try {
    const response = await axiosInstance.post(
      API_ROUTES.MEDIA.UPLOAD_SESSION,
      data,
      { headers }
    );

    return response.data.data;
  } catch (error: any) {
    console.error("Failed to create upload session:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to create upload session"
    );
  }
};

/**
 * Complete upload (verify and finalize)
 */
export const completeUpload = async (
  mediaId: string,
  headers: Record<string, string>
): Promise<CompleteUploadResponse> => {
  try {
    const response = await axiosInstance.post(
      API_ROUTES.MEDIA.COMPLETE(mediaId),
      {},
      { headers }
    );

    return response.data.data;
  } catch (error: any) {
    console.error("Failed to complete upload:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to complete upload"
    );
  }
};

/**
 * Get media by ID
 */
export const getMediaById = async (
  mediaId: string,
  headers: Record<string, string>
): Promise<MediaInfo> => {
  try {
    const response = await axiosInstance.get(API_ROUTES.MEDIA.GET(mediaId), {
      headers,
    });

    return response.data.data;
  } catch (error: any) {
    console.error("Failed to get media:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to get media"
    );
  }
};

/**
 * Delete media
 */
export const deleteMedia = async (
  mediaId: string,
  headers: Record<string, string>
): Promise<void> => {
  try {
    await axiosInstance.delete(API_ROUTES.MEDIA.DELETE(mediaId), {
      headers,
    });
  } catch (error: any) {
    console.error("Failed to delete media:", error);
    throw new Error(
      error.response?.data?.error?.message || "Failed to delete media"
    );
  }
};

/**
 * Upload file directly to R2 using presigned URL
 */
export const uploadFileToR2 = async (
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void,
  retries = 3,
  signal?: AbortSignal
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed due to network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted"));
    });

    // Handle external abort signal
    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Upload aborted by user"));
      });
    }

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
};

