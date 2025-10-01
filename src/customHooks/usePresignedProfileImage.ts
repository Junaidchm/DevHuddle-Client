
"use client";

import { useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { RootState } from "../store/store";
import { PROFILE_DEFAULT_URL } from "../constents";
import { getPresignedUrlForImage } from "../services/api/auth.service";
import { useSession } from "next-auth/react";

export default function usePresignedProfileImage() {
  // const user = useSelector((state: RootState) => state.user.user);
    const { data: session } = useSession();
    const user = session?.user;

  const isProfilePicAvailable =
    user?.image && user.image !== "null" ;

  const [profileImageUrl, setProfileImageUrl] = useState(
    isProfilePicAvailable && user.image?.startsWith('http') ? user.image : PROFILE_DEFAULT_URL
  );
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSignedUrl = async () => {
    if (!isProfilePicAvailable) {
      setProfileImageUrl(PROFILE_DEFAULT_URL);
      return;
    }

    try {
      const { url, expiresAt } = await getPresignedUrlForImage(user.image!);
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
  }, [user?.image]);

  return profileImageUrl;
}
