import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseAudioManifest, safeParseAudioManifest } from "@/lib/tts/manifest";

const validManifest = {
  version: 1,
  workId: "ji-cheng-tian-si-ye-you",
  provider: "local-pregenerated",
  voice: "Tingting-local-preview",
  format: "mp3",
  generatedAt: "2026-08-13T10:00:00.000Z",
  segments: [
    {
      id: "seg-001",
      url: "/audio/ji-cheng-tian-si-ye-you/seg-001.mp3",
      durationMs: 8400,
      checksum: "a".repeat(64),
      sourceHash: "b".repeat(64),
    },
  ],
} as const;

describe("audio manifest", () => {
  it("parses the public pre-generated audio contract", () => {
    expect(parseAudioManifest(validManifest)).toEqual(validManifest);
  });

  it.each([
    "/audio/ji-cheng-tian-si-ye-you/../secret.mp3",
    "/audio/ji-cheng-tian-si-ye-you/%2e%2e/secret.mp3",
    "/audio/ji-cheng-tian-si-ye-you/%252e%252e/secret.mp3",
    "/audio/ji-cheng-tian-si-ye-you/seg-001.mp3?token=secret",
    "https://example.com/audio/seg-001.mp3",
  ])("rejects unsafe or non-public URL %s", (url) => {
    expect(
      safeParseAudioManifest({
        ...validManifest,
        segments: [{ ...validManifest.segments[0], url }],
      }).success,
    ).toBe(false);
  });

  it("rejects mismatched formats and duplicate segment identifiers", () => {
    expect(
      safeParseAudioManifest({
        ...validManifest,
        segments: [
          validManifest.segments[0],
          {
            ...validManifest.segments[0],
            url: "/audio/ji-cheng-tian-si-ye-you/seg-002.wav",
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("validates the checked-in Golden Sample manifest", async () => {
    const manifestPath = path.join(
      process.cwd(),
      "storage",
      "audio",
      "ji-cheng-tian-si-ye-you",
      "manifest.json",
    );
    const raw = await readFile(manifestPath, "utf8");
    const manifest = parseAudioManifest(JSON.parse(raw) as unknown);

    expect(manifest.segments.map((segment) => segment.id)).toEqual([
      "seg-001",
      "seg-002",
      "seg-003",
      "seg-004",
      "seg-005",
    ]);
  });
});
