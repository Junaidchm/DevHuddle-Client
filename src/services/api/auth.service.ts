import { axiosInstance } from "@/src/axios/axios";
import {
  LoginPayload,
  RegisterPayload,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
  userUpdate,
  VerifyOTPPayload,
} from "@/src/types/auth";

export const userSingup = async (data: RegisterPayload) => {
  const response = await axiosInstance.post("/auth/signup", data);
  console.log('this is the sign up response :', response)
  return response;
};

export const resetOTP = async (email: string) => {
  const response = await axiosInstance.post("/auth/resend", { email });
  return response;
};

export const verifyOTP = async (data: VerifyOTPPayload) => {
  const response = await axiosInstance.post("auth/verify-otp", data);
  return response;
};

export const getUserfrom = async () => {
  const response = await axiosInstance.get("auth/me", {
    withCredentials: true,
  });
  return response;
};

export const signIn = async (data: LoginPayload) => {
  const response = await axiosInstance.post("auth/login", data, {
    withCredentials: true,
  });
  return response;
};

export const PsswordRestRequest = async (data: RequestPasswordResetPayload) => {
  const response = await axiosInstance.post("/auth/password-reset", data);
  return response;
};

export const ResetPassword = async (data: ResetPasswordPayload) => {
  const response = await axiosInstance.post(
    "/auth/password-reset/confirm",
    data
  );
  return response;
};

export const getProfile = async () => {
  const response = await axiosInstance.get("/auth/profile", {
    withCredentials: true,
  });
  return response;
};

export const updateProfile = async (payload:userUpdate ) => {
  const response = await axiosInstance.patch("/auth/profile", payload, {
    withCredentials: true,
  });
  return response.data;
};

export const getPresignedUrlForImage = async (key: string) => {
    try {
      console.log('image get url going :................')
      const response = await axiosInstance.post("/auth/generate-presigned-url", {
        operation: 'GET',
        key,  
      }, {
        withCredentials: true,
      });
      console.log('image get url going :................')
      return response.data
    } catch (err: any) {
      throw new Error('Failed to get presigned URL for image');
    }
  };

export const uploadToS3 = async (file: File) => {
    try {
      // Step 1: Get the presigned URL from your backend
      const response = await axiosInstance.post(
        `/auth/generate-presigned-url`,
        {
          operation: "PUT",
          fileName: file.name,
          fileType: file.type,
        },
        {
          withCredentials: true,
        }
      );

      console.log(response)

      const { url, key : presignedKey} = response.data;

      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type, // like :  image/jpeg
        },
        body: file,
      });
     
      console.log('this is the presigned key : ' , presignedKey)
      return presignedKey;
    } catch (err: any) {
      console.error("Upload error:", err);
      throw new Error("Failed to upload profile picture to S3");
    }
  };


export const logoutUser = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response;
};


export const validateAccessRefresh = async ()=> {
  const response = await axiosInstance.post("/auth/me");
  return response;
}