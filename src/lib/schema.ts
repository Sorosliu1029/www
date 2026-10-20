import { z } from "astro/zod";

export const projectSchema = z.object({
  title: z.string(),
  tagline: z.string().max(120),
  url: z.string().url(),
  repo: z.string().url().optional(),
  lang: z.enum(["zh", "en"]),
  year: z.number().int(),
  tags: z.array(z.string()).default([]),
  stack: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  cover: z.string().optional(),
  draft: z.boolean().default(false),
});

export type Project = z.infer<typeof projectSchema>;
