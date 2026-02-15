
/**
 * ✅ Centralized utility to construct media URLs
 * 
 * Handles:
 * - Absolute URLs (https://, http://)
 * - Blob URLs (blob:)
 * - Relative paths (prefixed with NEXT_PUBLIC_IMAGE_PATH)
 * - Missing environment variables (no "undefined" prefix)
 */
export const getMediaUrl = (url: string | undefined | null): string => {
  if (!url) return "";
  
  // If it's already a full URL or blob, return as is
  if (
    url.startsWith("http://") || 
    url.startsWith("https://") || 
    url.startsWith("blob:")
  ) {
    return url;
  }

  // Get the base path from environment
  const basePath = process.env.NEXT_PUBLIC_IMAGE_PATH || "";
  
  // Clean up potential double slashes
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  const cleanBase = basePath.endsWith("/") ? basePath : (basePath ? `${basePath}/` : "");

  return `${cleanBase}${cleanUrl}`;
};
