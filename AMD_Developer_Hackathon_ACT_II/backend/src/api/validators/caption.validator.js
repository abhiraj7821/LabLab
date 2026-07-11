import { z } from "zod";

export const captionStyles = [
  "formal",
  "sarcastic",
  "humorous-tech",
  "humorous-nontech",
];

/**
 * Schema for POST /api/v1/caption body.
 * Supports either a single videoUrl or an array of videoUrls.
 */
export const createCaptionSchema = z.object({
  body: z
    .object({
      videoUrl: z.string().url().optional(),
      videoUrls: z.array(z.string().url()).optional(),
      duration: z.union([z.string(), z.number()]).optional(),
      styles: z.array(z.enum(captionStyles)).optional().default(["formal"]),
    })
    .refine((data) => data.videoUrl || data.videoUrls, {
      message: "Either videoUrl or videoUrls must be provided",
    }),
});

/**
 * Schema for GET /api/v1/caption/:id params.
 */
export const getCaptionParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
