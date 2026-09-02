import { z } from "zod";

import { AUDIO_FORMATS, type AudioManifest } from "./types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const sha256Pattern = /^[a-f0-9]{64}$/;

function isSafePublicAudioUrl(url: string) {
  if (
    !url.startsWith("/audio/") ||
    url.includes("\\") ||
    url.includes("?") ||
    url.includes("#") ||
    url.includes("%") ||
    url.includes("//")
  ) {
    return false;
  }

  try {
    const decoded = decodeURIComponent(url);
    return (
      /^\/audio\/[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9][a-z0-9._-]*\.(?:mp3|wav)$/.test(decoded) &&
      !decoded.split("/").some((part) => part === ".." || part === ".")
    );
  } catch {
    return false;
  }
}

export const audioManifestSegmentSchema = z
  .object({
    id: z.string().trim().regex(slugPattern, "segment id must be a lowercase slug"),
    url: z.string().trim().refine(isSafePublicAudioUrl, "audio URL must be a safe /audio/... path"),
    durationMs: z.number().int().positive().optional(),
    checksum: z.string().regex(sha256Pattern, "checksum must be a lowercase SHA-256 hex digest").optional(),
    sourceHash: z.string().regex(sha256Pattern, "sourceHash must be a lowercase SHA-256 hex digest").optional(),
  })
  .strict();

export const audioManifestSchema = z
  .object({
    version: z.literal(1),
    workId: z.string().trim().regex(slugPattern, "workId must be a lowercase slug"),
    provider: z.string().trim().min(1),
    voice: z.string().trim().min(1),
    voiceId: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u).optional(),
    format: z.enum(AUDIO_FORMATS),
    generatedAt: z.iso.datetime({ offset: true }).optional(),
    segments: z.array(audioManifestSegmentSchema).min(1),
  })
  .strict()
  .superRefine((manifest, context) => {
    const ids = new Set<string>();
    const urls = new Set<string>();
    const expectedPrefix = `/audio/${manifest.workId}/`;
    const expectedExtension = `.${manifest.format}`;

    for (const [index, segment] of manifest.segments.entries()) {
      if (ids.has(segment.id)) {
        context.addIssue({
          code: "custom",
          path: ["segments", index, "id"],
          message: `duplicate segment id: ${segment.id}`,
        });
      }
      ids.add(segment.id);

      if (urls.has(segment.url)) {
        context.addIssue({
          code: "custom",
          path: ["segments", index, "url"],
          message: `duplicate audio URL: ${segment.url}`,
        });
      }
      urls.add(segment.url);

      if (!segment.url.startsWith(expectedPrefix) || !segment.url.endsWith(expectedExtension)) {
        context.addIssue({
          code: "custom",
          path: ["segments", index, "url"],
          message: `audio URL must match ${expectedPrefix}*.${manifest.format}`,
        });
      }

      if (!((segment.url.endsWith("/" + segment.id + "." + manifest.format)) || (segment.url.includes("/" + segment.id + "-voice-") && segment.url.endsWith(expectedExtension)))) {
        context.addIssue({
          code: "custom",
          path: ["segments", index, "url"],
          message: `audio URL filename must match segment id ${segment.id}`,
        });
      }
    }
  });

export function parseAudioManifest(input: unknown): AudioManifest {
  return audioManifestSchema.parse(input);
}

export function safeParseAudioManifest(input: unknown) {
  return audioManifestSchema.safeParse(input);
}
