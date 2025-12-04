import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/auth";


interface AttachmentInput {
  access_token: string;
  refresh_token: string;
}

const f = createUploadthing();

export const fileRouter = {
  attachment: f({
    image: { maxFileSize: "1MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 1 }, // ✅ Fixed: Using valid UploadThing size limit
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("unauthorized");
      }

      return { accesToken: session.user.accessToken };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      // ✅ FIX: Fast finalization with timeout to prevent blocking UploadThing
      const timeout = 4000; // 4 seconds - strict timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch(`${process.env.LOCAL_APIGATEWAY_URL}/feed/media`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${metadata.accesToken}`,
          },
          body: JSON.stringify({
            url: file.ufsUrl,
            type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[UploadThing] Finalization failed:", res.status, errorText);
          // Return URL without mediaId - client will handle retry
          return { url: file.ufsUrl };
        }

        const result = await res.json();
        if (result.mediaId) {
          console.log("[UploadThing] Media finalized:", result.mediaId);
          return { mediaId: result.mediaId, url: file.ufsUrl };
        } else {
          console.error("[UploadThing] Response missing mediaId:", result);
          return { url: file.ufsUrl };
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          console.warn("[UploadThing] Finalization timeout - returning URL for client-side retry");
        } else {
          console.error("[UploadThing] Finalization error:", error.message);
        }
        
        // Return URL without mediaId - client will handle retry
        return { url: file.ufsUrl };
      }
    }),
  projectMedia: f({
    image: { maxFileSize: "4MB", maxFileCount: 10 }, // ✅ Fixed: Using valid UploadThing size limit
    video: { maxFileSize: "64MB", maxFileCount: 5 }, // ✅ Fixed: Using valid UploadThing size limit
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("unauthorized");
      }

      return { accesToken: session.user.accessToken };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      // ✅ FIX: Fast finalization with timeout to prevent blocking UploadThing
      const timeout = 4000; // 4 seconds - strict timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const res = await fetch(`${process.env.LOCAL_APIGATEWAY_URL}/api/v1/projects/media`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${metadata.accesToken}`,
          },
          body: JSON.stringify({
            url: file.ufsUrl,
            type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
            fileSize: file.size,
            mimeType: file.type,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("[UploadThing] Project media finalization failed:", res.status, errorText);
          return { url: file.ufsUrl };
        }

        const result = await res.json();
        if (result.mediaId) {
          console.log("[UploadThing] Project media finalized:", result.mediaId);
          return { mediaId: result.mediaId, url: file.ufsUrl };
        } else {
          console.error("[UploadThing] Project media response missing mediaId:", result);
          return { url: file.ufsUrl };
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          console.warn("[UploadThing] Project media finalization timeout - returning URL for client-side retry");
        } else {
          console.error("[UploadThing] Project media finalization error:", error.message);
        }
        
        return { url: file.ufsUrl };
      }
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
