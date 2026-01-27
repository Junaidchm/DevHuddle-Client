import { axiosInstance } from "@/src/axios/axios";
import {
  LoginPayload,
  RegisterPayload,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
  userUpdate,
  VerifyOTPPayload,
} from "@/src/types/auth";
import { API_ROUTES } from "@/src/constants/api.routes";

// ----------------- Public APIs -----------------

export const userSignup = async (data: RegisterPayload) => {
  const response = await axiosInstance.post(API_ROUTES.AUTH.SIGNUP, data);
  return response;
};

export const resetOTP = async (email: string) => {
  const response = await axiosInstance.post(API_ROUTES.AUTH.RESEND_OTP, { email });
  return response;
};

export const verifyOTP = async (data: VerifyOTPPayload) => {
  const response = await axiosInstance.post(API_ROUTES.AUTH.VERIFY_OTP, data);
  return response;
};

export const signIn = async (data: LoginPayload) => {
  const response = await axiosInstance.post(API_ROUTES.AUTH.LOGIN, data, {
    withCredentials: true,
  });
  return response;
};

export const passwordResetRequest = async (data: RequestPasswordResetPayload) => {
  const response = await axiosInstance.post(API_ROUTES.AUTH.PASSWORD_RESET, data);
  return response;
};

export const resetPassword = async (data: ResetPasswordPayload) => {
  const response = await axiosInstance.post(API_ROUTES.AUTH.PASSWORD_RESET_CONFIRM, data);
  return response;
};

// ----------------- Protected APIs -----------------

/**
 * ✅ FIXED: Auth service
 * 
 * All protected API calls now accept headers as parameters.
 * Components should pass auth headers from useAuthHeaders() hook.
 * All routes now use centralized route constants.
 */

export const getUser = async (headers: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.AUTH.ME, { headers });
  return response;
};

export const getProfile = async (headers: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.AUTH.PROFILE, { headers });
  return response;
};

export const getProfileByUsername = async (username: string, headers?: Record<string, string>) => {
  const response = await axiosInstance.get(API_ROUTES.USERS.PROFILE_BY_USERNAME(username), { headers });
  return response.data;
};

export const updateProfile = async (payload: userUpdate, headers: Record<string, string>) => {
  const response = await axiosInstance.patch(API_ROUTES.AUTH.PROFILE, payload, { headers });
  return response.data;
};

export const getPresignedUrlForImage = async (key: string, headers: Record<string, string>) => {
  try {
    const response = await axiosInstance.post(
      API_ROUTES.AUTH.GENERATE_PRESIGNED_URL,
      { operation: "GET", key },
      { headers }
    );
    return response.data;
  } catch {
    throw new Error("Failed to get presigned URL for image");
  }
};

export const uploadToS3 = async (file: File, headers: Record<string, string>) => {
  try {
    // Step 1: Get the presigned URL from your backend
    const response = await axiosInstance.post(
      API_ROUTES.AUTH.GENERATE_PRESIGNED_URL,
      {
        operation: "PUT",
        fileName: file.name,
        fileType: file.type,
      },
      { headers }
    );

    const { url, key: presignedKey } = response.data;

    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    return presignedKey;  
  } catch (err: any) {
    console.error("Upload error:", err);
    throw new Error("Failed to upload profile picture to S3");
  }
};

export const logoutUser = async (headers: Record<string, string>) => {
  const response = await axiosInstance.post(API_ROUTES.AUTH.LOGOUT, {}, { headers });
  return response;
};

export const validateAccessRefresh = async (headers: Record<string, string>) => {
  const response = await axiosInstance.post(API_ROUTES.AUTH.ME, {}, { headers });
  return response;
};
