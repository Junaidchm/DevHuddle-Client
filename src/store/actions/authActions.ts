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
  getUserfrom,
  // RequestPasswordReset,
  ResetPassword,
  signIn,
  userSingup,
  verifyOTP,
} from "@/src/services/api/auth.service";

export const register = createAsyncThunk<
  void,
  RegisterPayload,
  { rejectValue: string }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    await userSingup(data);
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
    const user = await verifyOTP(data);
    localStorage.removeItem("signupEmail");
    const response = await getUserfrom();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "OTP verification failed"
    );
  }
});

export const GetUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/getUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserfrom();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);

export const loginUser = createAsyncThunk<
  User,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (data, { rejectWithValue }) => {
  try {
    await signIn(data);
    const response = await getUserfrom();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const googleAuth = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/googleAuth",
  async (_, { rejectWithValue }) => {
    try {
      window.location.href = "http://localhost:8080/auth/google";
    } catch (error: any) {
      return rejectWithValue("Failed to initiate Google authentication");
    }
  }
);

export const getUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/getUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserfrom()
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
  }
);


export const requestPasswordReset = createAsyncThunk<
  void,
  RequestPasswordResetPayload,
  { rejectValue: string }
>("auth/requestPasswordReset", async (data, { rejectWithValue }) => {
  try {
    // const response = await RequestPasswordReset(data);
    // return response.data
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
    await ResetPassword(data);
  } catch (err: any) {
    rejectWithValue(err.response?.data?.message || "Failed to reset password");
  }
});
