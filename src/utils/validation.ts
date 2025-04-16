import z from "zod";

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long " })
    .max(12, { message: "Username must be at most 12 characters long " }),

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long " })
    .max(12, { message: "Password must be at most 12 characters long " })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, {
      message: "Password must contain at least one special character",
    }),
});

export const signinSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const searchSchema = z.object({
  query: z.string().min(1, { message: "Search query is required" })
});

export const contentSchema = z.object({
  title: z.string().optional(),
  link: z.string().url().optional(),
  type: z.string(),
  content: z.string().optional()
});

export const shareSchema = z.object({
  share: z.boolean()
});