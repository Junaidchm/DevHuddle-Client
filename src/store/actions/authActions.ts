import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  RegisterPayload,
  User,
  VerifyOTPPayload,
  LoginPayload,
  RequestPasswordResetPayload,
  ResetPasswordPayload,
} from "@/src/types/auth";
import {
  getUser as getUserFromApi,
  passwordResetRequest,
  resetPassword as resetPasswordApi,
  userSignup,
  verifyOTP,
} from "@/src/services/api/auth.service";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import { getSession } from "next-auth/react";

export const register = createAsyncThunk<
  void,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    await userSignup(data);
    localStorage.setItem("signupEmail", data.email);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Registration failed"
    );
  }
});

export const verifyOtp = createAsyncThunk<
  User,
  VerifyOTPPayload,
  { rejectValue: string }
>("auth/verifyOTP", async (data, { rejectWithValue }) => {
  try {
    await verifyOTP(data);
    localStorage.removeItem("signupEmail");
    const session = await getSession();
    const headers = { Authorization: `Bearer ${session?.user?.accessToken}` };
    const response = await getUserFromApi(headers);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "OTP verification failed"
    );
  }
});

export const loginUser = createAsyncThunk<
  User,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    // The actual sign-in is handled by NextAuth.
    // After sign-in, we get the session and fetch user data.
    const session = await getSession();
    if (!session?.user?.accessToken) {
      throw new Error("Authentication failed or access token missing.");
    }
    const headers = { Authorization: `Bearer ${session.user.accessToken}` };
    const response = await getUserFromApi(headers);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const googleAuth = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/googleAuth", async (_, { rejectWithValue }) => {
    try {
      window.location.href = "http://localhost:8080/api/v1/auth/google";
    } catch (error: any) {
      return rejectWithValue("Failed to initiate Google authentication");
    }
  }
);

export const getUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    try {
      const session = await getSession();
      if (!session?.user?.accessToken) {
        throw new Error("Not authenticated");
      }
      const headers = { Authorization: `Bearer ${session.user.accessToken}` };
      const response = await getUserFromApi(headers);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const requestPasswordReset = createAsyncThunk<
  void,
  RequestPasswordResetPayload,
  { rejectValue: string }
>("auth/requestPasswordReset", async (data, { rejectWithValue }) => {
  try {
    const response = await passwordResetRequest(data);
    return response.data;
  } catch (err: any) {
    rejectWithValue(
      err.response?.data?.message || "Failed to request password reset"
    );
  }
});

export const resetPassword = createAsyncThunk<
  void,
  ResetPasswordPayload,
  { rejectValue: string }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  try {
    await resetPasswordApi(data);
  } catch (err: any) {
    rejectWithValue(err.response?.data?.message || "Failed to reset password");
  }
});
