import axiosInstance from "@/src/axios/axios";
import toast from "react-hot-toast";

export const getPresignedUrl = async (
  operation: "PUT" | "GET",
  fileName?: string,
  fileType?: string,
  key?: string
): Promise<{ url: string; key: string; expiresAt: number }> => {
  try {
    let payload =
      operation === "PUT"
        ? { operation, fileName, fileType }
        : { operation, key };
    const response = await axiosInstance.post(
      "/generate-presigned-url",
      payload
    );
    return response.data;
  } catch (err: any) {
    toast.error("Failed to get presigned URL");
    console.error("Failed to get presigned URL:", err);
    throw new Error("Failed to get presigned URL");
  }
};
