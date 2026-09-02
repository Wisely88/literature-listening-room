import { z } from "zod";

export const rightsStatusSchema = z.enum([
  "public-domain",
  "licensed",
  "user-owned",
  "personal-reference",
  "unknown",
]);

const stringList = z.array(z.string().trim().min(1)).default([]);

export const workFrontmatterSchema = z.object({
  id: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  title: z.string().trim().min(1),
  aliases: stringList,
  authorId: z.string().trim().min(1),
  category: z.string().trim().min(1),
  foreignGenre: z.string().trim().min(1).optional(),
  dynasty: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).default("zh-CN"),
  estimatedMinutes: z.number().int().positive().optional(),
  rightsStatus: rightsStatusSchema,
  summary: z.string().trim().min(1),
  tags: stringList,
  moods: stringList,
  ambience: stringList,
  defaultAmbience: z.string().trim().min(1).optional(),
  sourceNote: z.string().trim().min(1).optional(),
  editorialNotes: stringList,
  pronunciationOverrides: z
    .array(
      z.object({
        term: z.string().trim().min(1),
        pronunciation: z.string().trim().min(1),
      }),
    )
    .default([]),
});

export const annotationSchema = z.object({
  id: z.string().trim().min(1),
  workId: z.string().trim().min(1),
  segmentId: z.string().trim().min(1).optional(),
  term: z.string().trim().min(1),
  explanation: z.string().trim().min(1),
  pronunciation: z.string().trim().min(1).optional(),
  type: z.enum(["word", "person", "place", "allusion", "history", "grammar"]),
});

export const annotationsSchema = z.array(annotationSchema);

export const authorSchema = z.object({
  id: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  name: z.string().trim().min(1),
  aliases: stringList,
  courtesyNames: stringList,
  birthYear: z.number().int().optional(),
  deathYear: z.number().int().optional(),
  dynasty: z.string().trim().min(1).optional(),
  country: z.string().trim().min(1).optional(),
  bio: z.string().trim().min(1),
  styleSummary: z.string().trim().min(1).optional(),
  timeline: z
    .array(
      z.object({
        year: z.number().int(),
        title: z.string().trim().min(1),
        description: z.string().trim().min(1),
      }),
    )
    .default([]),
  representativeWorks: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        type: z.string().trim().min(1),
      }),
    )
    .default([]),
  relatedPeople: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        name: z.string().trim().min(1),
        relationship: z.string().trim().min(1),
        summary: z.string().trim().min(1),
      }),
    )
    .default([]),
});
