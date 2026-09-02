import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { ManualAudioProvider } from "@/lib/tts/server/manual-audio-provider";

describe("ManualAudioProvider", () => {
  it("registers an existing file under a stable public audio URL", async () => {
    const testRoot = await mkdtemp(path.join(os.tmpdir(), "listening-room-manual-"));
    const publicRoot = path.join(testRoot, "public");
    const sourcePath = path.join(testRoot, "recording.mp3");
    await writeFile(sourcePath, "fake-audio-for-contract-test");

    const provider = new ManualAudioProvider({ publicRoot });
    const audioUrl = await provider.register({
      sourcePath,
      workId: "sample-work",
      segmentId: "seg-001",
    });

    expect(audioUrl).toBe("/audio/sample-work/seg-001.mp3");
    await expect(readFile(path.join(publicRoot, "audio", "sample-work", "seg-001.mp3"), "utf8")).resolves.toBe(
      "fake-audio-for-contract-test",
    );
  });

  it("resolves only a pre-generated file and never performs browser speech", async () => {
    const publicRoot = await mkdtemp(path.join(os.tmpdir(), "listening-room-public-"));
    const provider = new ManualAudioProvider({ publicRoot });

    await expect(
      provider.synthesize({
        text: "测试",
        voice: "manual-voice",
        workId: "sample-work",
        segmentId: "seg-001",
      }),
    ).rejects.toThrow();
  });

  it("treats registering a file already at its destination as an idempotent no-op", async () => {
    const publicRoot = await mkdtemp(path.join(os.tmpdir(), "listening-room-idempotent-"));
    const destination = path.join(publicRoot, "audio", "sample-work", "seg-001.mp3");
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, "existing-audio");

    const provider = new ManualAudioProvider({ publicRoot });
    await expect(
      provider.register({
        sourcePath: destination,
        workId: "sample-work",
        segmentId: "seg-001",
      }),
    ).resolves.toBe("/audio/sample-work/seg-001.mp3");
    await expect(readFile(destination, "utf8")).resolves.toBe("existing-audio");
  });

  it("rejects a declared format that does not match the manual source", async () => {
    const testRoot = await mkdtemp(path.join(os.tmpdir(), "listening-room-format-"));
    const sourcePath = path.join(testRoot, "recording.wav");
    await writeFile(sourcePath, "fake-wav");

    const provider = new ManualAudioProvider({ publicRoot: path.join(testRoot, "public") });
    await expect(
      provider.register({
        sourcePath,
        workId: "sample-work",
        segmentId: "seg-001",
        format: "mp3",
      }),
    ).rejects.toThrow("does not match");
  });
});
