
"use client";

import { useEffect, useState, useRef } from "react";
import { PROFILE_DEFAULT_URL } from "../constents";
import { getPresignedUrlForImage } from "../services/api/auth.service";
import { fetchUserFullDetails } from "../services/api/admin.service";
import { User } from "../types/auth";

export default function usePresignedProfileImageForAdmin(user:User):string {
  
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profilePicture ? user.profilePicture : PROFILE_DEFAULT_URL);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSignedUrl = async () => {
    if (user?.profilePicture) {
      try {
        const { url, expiresAt } = await getPresignedUrlForImage(user.profilePicture);
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
    } else {
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
