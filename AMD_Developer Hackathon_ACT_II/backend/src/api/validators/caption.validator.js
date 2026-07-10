import { z } from "zod";

/**
 * Caption styles enum.
 */
export const captionStyles = [
  "formal",
  "sarcastic",
  "humorous-tech",
  "humorous-nontech",
];

/**
 * Schema for POST /api/v1/caption body.
 * Accepts a URL or a file upload (multipart handled separately).
 */
export const createCaptionSchema = z.object({
  body: z.object({
    videoUrl: z.string().url().optional(),
    duration: z.union([z.string(), z.number()]).optional(),
    styles: z.array(z.enum(captionStyles)).optional().default(["formal"]),
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
