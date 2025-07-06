import { axiosInstance } from "@/src/axios/axios";
import {
  LoginPayload,
  RegisterPayload,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
  VerifyOTPPayload,
} from "@/src/types/auth";

export const userSingup = async (data: RegisterPayload) => {
  const response = await axiosInstance.post("/auth/signup", data);
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


export const PsswordRestRequest = async (data:RequestPasswordResetPayload)=> {
    const response = await axiosInstance.post("/auth/password-reset",data)
    return response
}

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

export const updateProfile = async (formdata:FormData)=> {
  const response = await axiosInstance.patch("/auth/profile",formdata,{
    withCredentials: true,
  })
  return response.data
}

export const logoutUser = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response;
};



