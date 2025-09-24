
"use client";

import { useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { RootState } from "../store/store";
import { PROFILE_DEFAULT_URL } from "../constents";
import { getPresignedUrlForImage } from "../services/api/auth.service";

export default function usePresignedProfileImage() {
  const user = useSelector((state: RootState) => state.user.user);

  const isProfilePicAvailable =
    user?.profilePicture && user.profilePicture !== "null" ;

  const [profileImageUrl, setProfileImageUrl] = useState(
    isProfilePicAvailable && user.profilePicture?.startsWith('http') ? user.profilePicture : PROFILE_DEFAULT_URL
  );

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSignedUrl = async () => {
    if (!isProfilePicAvailable) {
      setProfileImageUrl(PROFILE_DEFAULT_URL);
      return;
    }

    try {
      const { url, expiresAt } = await getPresignedUrlForImage(user.profilePicture!);
      setProfileImageUrl(url);

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const now = Date.now();
      const refreshIn = Math.max(expiresAt - now - 10000, 30000);

      refreshTimeoutRef.current = setTimeout(fetchSignedUrl, refreshIn);
    } catch (error) {
      setProfileImageUrl(PROFILE_DEFAULT_URL);
    }
  };

  useEffect(() => {
    fetchSignedUrl();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [user?.profilePicture]);

  return profileImageUrl;
}
