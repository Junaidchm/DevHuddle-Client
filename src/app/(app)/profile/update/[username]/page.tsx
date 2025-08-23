"use client";

import {
  getPresignedUrlForImage,
  getProfile,
  updateProfile,
  uploadToS3,
} from "@/src/services/api/auth.service";
import {
  Button,
  Card,
  FormInput,
  FormTextarea,
  SettingsTab,
  TechBadge,
} from "./components";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProfileSkeleton from "./profileSkeleton";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { PROFILE_DEFAULT_URL } from "@/src/constents";
import profileSchema from "@/src/zodSchemas/profileupdate";
import AvatarUploader from "@/src/components/layouts/AvatarUploader";
import { useRedirectIfNotAuthenticated } from "@/src/customHooks/useRedirectIfAuthenticated";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/src/store/store";
import { setProfilePicture } from "@/src/store/slices/userSlice";
import { useRouter } from "next/navigation";
import { useProtected } from "@/src/customHooks/useProtected";
import showLogoutConfirmation from "@/src/utils/showLogoutConfirmation";
import { userUpdate } from "@/src/types/auth";
import usePresignedProfileImage from "@/src/customHooks/usePresignedProfileImage";

export default function ProfilePage() {
  useRedirectIfNotAuthenticated();
  useProtected();
  const profileImageUrl = usePresignedProfileImage();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await getProfile();
        return res.data;
      } catch (err: any) {
        throw new Error("Could not load profile data");
      }
    },
    queryKey: ["profile"],
    staleTime: 10000,
  });

  type ProfileFormData = z.infer<typeof profileSchema>;
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      location: "",
      bio: "",
      profileImage: undefined,
    },
  });

  useEffect(() => {
    if (profileData) {
      const initialFormData = {
        fullName: profileData.name || "",
        username: profileData.username || "",
        email: profileData.email || "",
        location: profileData.location || "",
        bio: profileData.bio || "",
        profileImage: profileData.profilePicture || undefined,
      };
      reset(initialFormData);
      setOriginalData(initialFormData);
    }
  }, [profileData, reset]);

  const watchFields = watch();

  const hasChanges = useMemo(() => {
    if (!originalData) return false;

    return (
      watchFields.fullName !== originalData.fullName ||
      watchFields.username !== originalData.username ||
      watchFields.location !== originalData.location ||
      watchFields.bio !== originalData.bio ||
      watchFields.profileImage !== originalData.profileImage
    );
  }, [watchFields, originalData]);

  const onSubmit = async (data: ProfileFormData) => {

    try {
      const payload: userUpdate = {
        name: data.fullName || "",
        username: data.username || "",
        location: data.location || "",
        bio: data.bio || "",
      };
      let profilePictureKey: string | undefined;
      if (data.profileImage instanceof File) {
        profilePictureKey = await uploadToS3(data.profileImage);
        payload.profilePicture = profilePictureKey;
      }
     
      console.log('this is the profile picuture key')
      await updateProfile(payload);
      if (profilePictureKey) {
        dispatch(setProfilePicture(profilePictureKey));
      }
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (err: any) {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <div className="font-['Inter'] bg-gray-50 text-gray-800 leading-6">
      <div className="container max-w-6xl mx-auto px-6 py-8 flex gap-8 lg:flex-row flex-col">
        <aside className="settings-sidebar w-full lg:w-[280px] flex-shrink-0">
          <div className="settings-tabs bg-white rounded-xl shadow-md overflow-hidden">
            <SettingsTab icon="fas fa-user" text="Profile" isActive={true} />
            <SettingsTab
              icon="fas fa-bell"
              text="Notifications"
              isActive={false}
            />
            <SettingsTab
              icon="fas fa-link"
              text="Connected Accounts"
              isActive={false}
            />
            <SettingsTab
              icon="fas fa-shield-alt"
              text="Security"
              isActive={false}
            />
            <SettingsTab
              icon="fas fa-palette"
              text="Appearance"
              isActive={false}
            />
            <SettingsTab icon="fas fa-cog" text="General" isActive={false} />
            <SettingsTab
              icon="fas fa-sign-out-alt"
              text="Logout"
              isActive={false}
              onclick={() =>
                showLogoutConfirmation(dispatch, router, "/signIn")
              }
            />
          </div>
        </aside>

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <main className="main-content flex-1">
            <form onSubmit={handleSubmit(onSubmit)}>
              <h1 className="page-title text-3xl font-bold mb-6 text-gray-800">
                Profile Settings
              </h1>

              <Card title="Profile Information" icon="fas fa-user-circle">
                <div className="profile-avatar flex lg:flex-row flex-col items-start gap-6 mb-6">
                  <Controller
                    name="profileImage"
                    control={control}
                    render={({ field }) => (
                      <AvatarUploader
                        onImageCropped={(file, previewUrl) => {
                          field.onChange(file);
                          setPreviewImage(previewUrl);
                        }}
                        value={field.value}
                        previewUrl={previewImage}
                        PROFILE_DEFAULT_URL={
                          profileImageUrl || PROFILE_DEFAULT_URL
                        }
                      />
                    )}
                  />
                </div>
                <FormInput
                  id="fullName"
                  label="Full Name"
                  type="text"
                  {...register("fullName")}
                  error={errors.fullName?.message}
                />
                <FormInput
                  id="username"
                  label="Username"
                  type="text"
                  helpText="devhuddle.com/profile/yourname"
                  {...register("username")}
                  error={errors.username?.message}
                />
                <FormInput
                  id="email"
                  label="Email Address"
                  type="email"
                  {...register("email")}
                  error={errors.email?.message}
                  disabled
                />
                <FormInput
                  id="location"
                  label="Location"
                  type="text"
                  {...register("location")}
                  error={errors.location?.message}
                />
                <FormTextarea
                  id="bio"
                  label="Bio"
                  helpText="Brief description about yourself. Markdown is supported."
                  {...register("bio")}
                  error={errors.bio?.message}
                />
              </Card>

              <div className="submit-actions flex justify-end gap-4 mt-8">
                <Button text="Cancel" variant="secondary" />
                <Button
                  text="Save Changes"
                  disabled={!hasChanges || isSubmitting}
                  variant="primary"
                  type="submit"
                />
              </div>

              <div className="delete-account mt-8 pt-8 border-t border-gray-200">
                <div className="delete-account-title text-lg font-semibold text-red-600 mb-3">
                  Delete Account
                </div>
                <div className="delete-account-text text-gray-500 mb-6 text-[0.95rem]">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </div>
                <Button
                  text="Delete Account"
                  variant="danger"
                  icon="fas fa-trash-alt"
                />
              </div>
            </form>
          </main>
        )}
      </div>
    </div>
  );
}
