import { z } from "zod";

const profileSchema = z.object({
  username: z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/, {
      message:
        "Username must be alphanumeric, may include underscores or hyphens, and cannot start or end with special characters",
    })
    .regex(/^\S*$/, {
      message: "Username cannot contain whitespace",
    })
    .optional(),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must be at most 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, {
      message:
        "Full name can only contain letters, spaces, apostrophes, and hyphens",
    })
    .regex(/^\S.*\S$/, {
      message: "Full name cannot start or end with whitespace",
    })
    .optional(),
    location: z
      .string()
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location must be at most 100 characters")
      .regex(/^[a-zA-Z\s,.-]+$/, {
        message:
          "Location can only contain letters, spaces, commas, periods, and hyphens",
      })
      .regex(/^\S.*\S$/, {
        message: "Location cannot start or end with whitespace",
      })
      .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email must be at most 254 characters"),
  bio: z
    .string()
    .max(300, "Bio must be at most 300 characters")
    .regex(/^[^\x00-\x1F\x7F]*$/, {
      message: "Bio cannot contain control characters",
    })
    .optional(),
  profileImage: z.any().optional(),
});

export default profileSchema;
