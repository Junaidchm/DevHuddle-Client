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
    video: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();

      if (!session?.user) {
        throw new UploadThingError("unauthorized");
      }

      return { accesToken: session.user.accessToken };
    })
    .onUploadComplete(async ({ file, metadata }) => {
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

      const result = await res.json();

      return { mediaId: result.mediaId };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
