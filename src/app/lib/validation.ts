import { z } from "zod";

const requiredString = z.string().trim().min(1, "Required");

export const createPostSchema = z.object({
  content: requiredString,
//   mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachment"),
});
