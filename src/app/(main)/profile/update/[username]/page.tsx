"use client";

import {
  getProfile,
  updateProfile,
} from "@/src/services/api/auth.service";
import { uploadProfileImage } from "@/src/services/api/media.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ProfileSkeleton from "./profileSkeleton";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { PROFILE_DEFAULT_URL } from "@/src/constants";
import profileSchema from "@/src/zodSchemas/profileupdate";
import AvatarUploader from "@/src/components/layouts/AvatarUploader";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/store";
import { setProfilePicture } from "@/src/store/slices/userSlice";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import showLogoutConfirmation from "@/src/utils/showLogoutConfirmation";
import { userUpdate } from "@/src/types/auth";
import { useAuthHeaders } from "@/src/customHooks/useAuthHeaders";
import SkillsInput from "@/src/components/profile/SkillsInput";

// New UI Components
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { 
  User, 
  Bell, 
  Link as LinkIcon, 
  Shield, 
  Palette, 
  Settings, 
  LogOut, 
  Trash2 
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function ProfilePage() {
  const authHeaders = useAuthHeaders();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const {
    data: profileData,
    isLoading,
  } = useQuery({
    queryFn: async () => {
      try {
        const res = await getProfile(authHeaders);
        return res.data;
      } catch (err: any) {
        throw new Error("Could not load profile data");
      }
    },
    queryKey: ["profile"],
    staleTime: 10000,
  });

  type ProfileFormData = z.infer<typeof profileSchema>;
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(null);

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
      skills: [],
      jobTitle: "",
      company: "",
      yearsOfExperience: "",
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
        skills: profileData.skills || [],
        jobTitle: profileData.jobTitle || "",
        company: profileData.company || "",
        yearsOfExperience: profileData.yearsOfExperience || "",
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
      JSON.stringify(watchFields.skills || []) !== JSON.stringify(originalData.skills || []) ||
      watchFields.jobTitle !== originalData.jobTitle ||
      watchFields.company !== originalData.company ||
      watchFields.yearsOfExperience !== originalData.yearsOfExperience ||
      watchFields.profileImage !== originalData.profileImage
    );
  }, [watchFields, originalData]);

  const { update } = useSession();

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: userUpdate = {
        name: data.fullName || "",
        username: data.username || "",
        location: data.location || "",
        bio: data.bio || "",
        skills: data.skills || [],
        jobTitle: data.jobTitle || "",
        company: data.company || "",
        yearsOfExperience: data.yearsOfExperience ? parseInt(data.yearsOfExperience) : 0,
      };
      let profilePictureKey: string | undefined;
      if (data.profileImage instanceof File) {
        profilePictureKey = await uploadProfileImage(data.profileImage, authHeaders);
        payload.profilePicture = profilePictureKey;
      }
     
      await updateProfile(payload, authHeaders);
      
      await update({
        ...payload,
        inputImage: profilePictureKey 
      });

      if (profilePictureKey) {
        dispatch(setProfilePicture(profilePictureKey));
      }
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      if (originalData?.username) {
        queryClient.invalidateQueries({ 
          queryKey: ["profiles", "detail", originalData.username] 
        });
      }
      if (data.username && data.username !== originalData?.username) {
        queryClient.invalidateQueries({ 
          queryKey: ["profiles", "detail", data.username] 
        });
        router.push(`/profile/${data.username}`);
      }
    } catch (err: any) {
      toast.error("Failed to update profile.");
    }
  };

  const SidebarItem = ({ icon: Icon, label, isActive, onClick, variant = "default" }: any) => (
      <button
        onClick={onClick}
        type="button"
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          variant === "danger" && "text-destructive hover:bg-destructive/10 hover:text-destructive"
        )}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
  );

  return (
    <div className="bg-background min-h-screen text-foreground">
      <div className="container max-w-6xl mx-auto px-4 py-8 flex gap-8 lg:flex-row flex-col">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-2">
          <Card className="p-2 border-border shadow-sm">
             <div className="space-y-1">
                <SidebarItem icon={User} label="Profile" isActive={true} />
                <SidebarItem icon={Bell} label="Notifications" />
                <SidebarItem icon={LinkIcon} label="Connected Accounts" />
                <SidebarItem icon={Shield} label="Security" />
                <SidebarItem icon={Palette} label="Appearance" />
                <SidebarItem icon={Settings} label="General" />
                <div className="my-2 border-t border-border" />
                <SidebarItem 
                    icon={LogOut} 
                    label="Logout" 
                    onClick={() => showLogoutConfirmation("/signIn")} 
                />
             </div>
          </Card>
        </aside>

        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <main className="flex-1 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your public profile and private information.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Profile Information Card */}
              <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your photo and personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                         <div className="flex-shrink-0">
                            <Label className="block mb-2 text-center sm:text-left">Profile Photo</Label>
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
                                    profileData?.profilePicture || PROFILE_DEFAULT_URL
                                    }
                                />
                                )}
                            />
                         </div>
                         
                         <div className="flex-1 w-full space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <Input id="fullName" {...register("fullName")} placeholder="Your full name" />
                                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" {...register("username")} placeholder="username" />
                                    {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" {...register("email")} disabled className="bg-muted" />
                                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" {...register("location")} placeholder="City, Country" />
                                {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                            </div>

                             <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea 
                                    id="bio" 
                                    {...register("bio")} 
                                    placeholder="Tell us a little bit about yourself"
                                    className="min-h-[100px]" 
                                />
                                <p className="text-xs text-muted-foreground">Markdown is supported.</p>
                                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                            </div>
                         </div>
                    </div>
                </CardContent>
              </Card>

              {/* Professional Information Card */}
              <Card>
                <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                    <CardDescription>Share your career details and skills.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input id="jobTitle" {...register("jobTitle")} placeholder="e.g. Senior Software Engineer" />
                            {errors.jobTitle && <p className="text-xs text-destructive">{errors.jobTitle.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input id="company" {...register("company")} placeholder="e.g. Acme Inc" />
                            {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Input id="yearsOfExperience" {...register("yearsOfExperience")} placeholder="e.g. 5" />
                        {errors.yearsOfExperience && <p className="text-xs text-destructive">{errors.yearsOfExperience.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Skills</Label>
                         <Controller
                            name="skills"
                            control={control}
                            render={({ field }) => (
                                <SkillsInput
                                value={field.value || []}
                                onChange={field.onChange}
                                error={errors.skills?.message}
                                />
                            )}
                        />
                    </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                 <Button type="button" variant="outline" onClick={() => reset()}>Cancel</Button>
                 <Button type="submit" disabled={!hasChanges || isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                 </Button>
              </div>

              {/* Delete Account */}
              <Card className="border-destructive/20 bg-destructive/5">
                 <CardContent className="pt-6 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-destructive mb-1">Delete Account</h3>
                        <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
                    </div>
                    <Button variant="destructive" type="button" className="shrink-0 gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                    </Button>
                 </CardContent>
              </Card>

            </form>
          </main>
        )}
      </div>
    </div>
  );
}
