import { generateReactHelpers } from "@uploadthing/react";
import { AppFileRouter } from "../api/uploadthing/core";

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<AppFileRouter>();
