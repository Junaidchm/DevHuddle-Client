export type RegisterPayload = {
  email: string;
  username: string;
  name: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: string;
  emailVerified: boolean;
  profilePicture?:string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  token: string;
}

export interface UserListing {
  id: string;
  email: string;
  username: string;
  name?: string;
  role: string;
  profilePicture?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  yearsOfExperience?: string;
  jobTitle?: string;
  company?: string;
}

export interface userUpdate {
  username?: string;
  name?: string;
  profilePicture?: string|undefined;
  location?: string;
  bio?: string;
  skills?: string[];
  yearsOfExperience?: string;
  jobTitle?: string;
  company?: string;
}