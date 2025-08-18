"use client";

import { useMedia } from "../contexts/MediaContext";

export function useGetMediaTransform(mediaId: string) {
  const { media } = useMedia();
  const targetImageTransform = media.filter((file) => file.id === mediaId)[0]?.transform;
  return targetImageTransform
}
