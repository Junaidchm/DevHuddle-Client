import axiosInstance from "@/src/axios/axios";
import toast from "react-hot-toast";

export const getPresignedUrl = async (
  folderPath:string,
  operation: "PUT" | "GET",
  fileName?: string,
  fileType?: string,
  key?: string
): Promise<{ url: string; key: string; expiresAt: number }> => {
  try {
    let payload =
      operation === "PUT"
        ? { folderPath,operation, fileName, fileType }
        : { operation, key };
    const response = await axiosInstance.post(
      "general/generate-presigned-url",
      payload,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (err: any) {
    console.error("Failed to get presigned URL:", err);
    throw new Error("Failed to get presigned URL");
  }
};
