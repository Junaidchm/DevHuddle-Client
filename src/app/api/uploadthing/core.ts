import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { serverFetchSilent } from "../../lib/auth";

const f = createUploadthing();

export const fileRouter = {
  attachment: f({
    image: { maxFileSize: "1MB", maxFileCount: 5 },
    video: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const res = await serverFetchSilent("/feed/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
          ),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        }),
      });

      if (!res.ok) {
        throw new UploadThingError("Failed to store media");
      }

      const data = await res.json();

      return { mediaId: data.mediaId }; 
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
