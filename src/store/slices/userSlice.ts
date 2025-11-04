import { User } from "@/src/types/auth";
import { createSlice } from "@reduxjs/toolkit";
import { register, loginUser, googleAuth, requestPasswordReset, resetPassword, verifyOtp, getUser } from "../actions/authActions";
import { error } from "console";


interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null | undefined;
  success: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  success: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    setProfilePicture: (state, {payload}) => {

      console.log("set Profile dispatch is working without any problem ==========================>");
      if (state.user) {
        console.log('this is the payload for profile image =================>' , payload)
        state.user.profilePicture = payload;
      }
    },
    logoutUserAction: (state) => {
    // Reset to initial state
    state.user = null;
    state.isAuthenticated = false;
    state.loading = false;
    state.error = null;
    state.success = false;
  },
  },
  extraReducers: (builder) => {
    builder
      // addUser
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = true;
        state.error = null; 
      })
      .addCase(register.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
        state.success = true;
      })
      .addCase(verifyOtp.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })

      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        console.log("getUser payload:", payload);
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
        state.success = true;
      })

      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(googleAuth.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      
      // Get User
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
      })
      .addCase(getUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.isAuthenticated = false;
        state.user = null;
      })
     
      // Request Password Reset
    builder
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to request password reset';
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to reset password';
      });

  },
});

export const { resetError,setProfilePicture ,logoutUserAction} = userSlice.actions;
export default userSlice.reducer;
