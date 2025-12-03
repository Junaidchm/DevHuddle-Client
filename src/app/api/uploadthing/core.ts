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
    video: { maxFileSize: "100MB", maxFileCount: 1 }, // ✅ Updated: Increased to 100MB for video uploads
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("unauthorized");
      }

      return { accesToken: session.user.accessToken };
    })
    .onUploadComplete(async ({ file, metadata }) => {
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
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Upload finalization failed:", res.status, errorText);
          throw new Error(`Failed to finalize upload: ${res.status} ${errorText}`);
        }

        const result = await res.json();

        if (!result.mediaId) {
          console.error("Upload finalization response missing mediaId:", result);
          throw new Error("Upload finalization response missing mediaId");
        }

        return { mediaId: result.mediaId };
      } catch (error: any) {
        console.error("Error in onUploadComplete:", error);
        // Re-throw to let UploadThing handle it
        throw error;
      }
    }),
  projectMedia: f({
    image: { maxFileSize: "5MB", maxFileCount: 10 },
    video: { maxFileSize: "100MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("unauthorized");
      }

      return { accesToken: session.user.accessToken };
    })
    .onUploadComplete(async ({ file, metadata }) => {
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
            width: file.width,
            height: file.height,
            fileSize: file.size,
            mimeType: file.type,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Project media upload finalization failed:", res.status, errorText);
          throw new Error(`Failed to finalize project media upload: ${res.status} ${errorText}`);
        }

        const result = await res.json();

        if (!result.mediaId) {
          console.error("Project media upload response missing mediaId:", result);
          throw new Error("Project media upload response missing mediaId");
        }

        return { mediaId: result.mediaId };
      } catch (error: any) {
        console.error("Error in project media onUploadComplete:", error);
        throw error;
      }
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
