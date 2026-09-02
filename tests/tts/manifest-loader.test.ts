import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { loadAudioManifest } from "@/lib/tts/server/manifest-loader";

describe("loadAudioManifest", () => {
  it("loads a validated manifest from the selected storage root", async () => {
    const storageRoot = await mkdtemp(path.join(os.tmpdir(), "listening-room-manifest-"));
    const workId = "sample-work";
    await mkdir(path.join(storageRoot, workId));
    await writeFile(
      path.join(storageRoot, workId, "manifest.json"),
      JSON.stringify({
        version: 1,
        workId,
        provider: "local-pregenerated",
        voice: "test-voice",
        format: "mp3",
        segments: [{ id: "seg-001", url: "/audio/sample-work/seg-001.mp3" }],
      }),
    );

    await expect(loadAudioManifest(workId, { storageRoot })).resolves.toMatchObject({ workId });
  });

  it("rejects work ids that could escape the storage root", async () => {
    await expect(loadAudioManifest("../secret", { storageRoot: "/tmp" })).rejects.toThrow(
      "Invalid audio manifest workId",
    );
  });
});
