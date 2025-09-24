import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { serverFetchSilent } from "../../lib/auth";
import { uploadMedia } from "@/src/services/api/feed.service";
import { cookies } from "next/headers";
import { validateAccessRefresh } from "@/src/services/api/auth.service";

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

      return {};
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log(
        "the feed media upload is going without any problem .........................."
      );

      // const res = await serverFetchSilent("/feed/media", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     // url: file.ufsUrl.replace(
      //     //   "/f/",
      //     //   `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      //     // ),
      //     url: file.ufsUrl,
      //     type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
      //   }),
      // });

      const res = await uploadMedia({
      // url: file.ufsUrl.replace(
      //   "/f/",
      //   `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`
      // ),
        url:file.ufsUrl,
        type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
      });

      // if (!res.ok) {
      //   throw new UploadThingError("Failed to store media");
      // }

      // console.log(
      //   "response is getting here without any problem ========================------------------->>>>>>>>>>>>>>>"
      // );

      // const data = await res.json();

      return { mediaId: res.mediaId };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof fileRouter;
