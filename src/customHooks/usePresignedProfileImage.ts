"use client";

import { useEffect, useState, useRef } from "react";
import { PROFILE_DEFAULT_URL } from "../constents";
import { getPresignedUrlForImage } from "../services/api/auth.service";
import { useSession } from "next-auth/react";
import { useAuthHeaders } from "../hooks/useAuthHeaders";

/**
 * ✅ FIXED: usePresignedProfileImage hook
 * 
 * Now properly uses useAuthHeaders() hook to get auth headers
 * and passes them to service functions
 */
export default function usePresignedProfileImage() {
  const { data: session } = useSession();
  const user = session?.user;
  const authHeaders = useAuthHeaders();

  const isProfilePicAvailable =
    user?.image && user.image !== "null" ;

  const [profileImageUrl, setProfileImageUrl] = useState(
    isProfilePicAvailable && user.image?.startsWith('http') ? user.image : PROFILE_DEFAULT_URL
  );
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSignedUrl = async () => {
    if (!isProfilePicAvailable || !authHeaders.Authorization) {
      setProfileImageUrl(PROFILE_DEFAULT_URL);
      return;
    }

    try {
      const { url, expiresAt } = await getPresignedUrlForImage(user.image!, authHeaders);
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
  }, [user?.image, authHeaders.Authorization]);

  return profileImageUrl;
}
