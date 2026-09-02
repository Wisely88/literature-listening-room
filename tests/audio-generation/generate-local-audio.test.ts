import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseAudioManifest } from "@/lib/tts/manifest";
import {
  buildFfmpegArgs,
  buildFfprobeArgs,
  buildSayArgs,
  parseDurationMs,
  parseLocalAudioArgs,
  resolveSafeOutputDirectory,
  segmentPublicUrl,
  segmentSourceHash,
  sha256Hex,
} from "@/scripts/generate-local-audio";

describe("local audio CLI arguments", () => {
  it("uses the Golden Sample, Tingting, and its public audio directory by default", () => {
    const root = path.resolve("/project");
    const options = parseLocalAudioArgs([], {}, root);

    expect(options).toEqual({
      projectRoot: root,
      slug: "ji-cheng-tian-si-ye-you",
      outputDirectory: path.join(root, "public", "audio", "ji-cheng-tian-si-ye-you"),
      sayVoice: "Tingting",
      sayRate: 145,
      manifestVoice: "Tingting-r145-local-preview",
      force: false,
      help: false,
    });
  });

  it("accepts explicit slug, output, env voice, and force without shell parsing", () => {
    const root = path.resolve("/project");
    const options = parseLocalAudioArgs(
      ["--slug=another-work", "--output", "staging/audio", "--force"],
      { LOCAL_TTS_VOICE: "Mei-Jia" },
      root,
    );

    expect(options.slug).toBe("another-work");
    expect(options.outputDirectory).toBe(path.join(root, "staging", "audio"));
    expect(options.sayVoice).toBe("Mei-Jia");
    expect(options.manifestVoice).toBe("Mei-Jia-r145-local-preview");
    expect(options.force).toBe(true);
  });

  it.each([
    [["--slug", "../escape"], "slug"],
    [["--output", "../escape"], "项目根目录"],
    [["--output", "/tmp/outside"], "项目根目录"],
    [["--voice", "bad\nvoice"], "音色"],
    [["--slug"], "--slug"],
    [["--force", "--force"], "重复"],
    [["--unknown"], "未知参数"],
  ])("rejects unsafe or ambiguous arguments: %j", (argv, message) => {
    expect(() => parseLocalAudioArgs(argv, {}, "/project")).toThrow(message);
  });

  it("rejects the project root itself as an output directory", () => {
    expect(() => resolveSafeOutputDirectory("/project", ".")).toThrow("不能是项目根目录");
  });
});

describe("local audio command argument builders", () => {
  it("passes say text through a file and keeps the voice as one argument", () => {
    expect(buildSayArgs("/tmp/input.txt", "/tmp/output.aiff", "Tingting; rm -rf /", 145))
      .toEqual([
        "-v",
        "Tingting; rm -rf /",
        "-r",
        "145",
        "-o",
        "/tmp/output.aiff",
        "-f",
        "/tmp/input.txt",
      ]);
  });

  it("builds deterministic, non-interactive ffmpeg arguments", () => {
    expect(buildFfmpegArgs("/tmp/input.aiff", "/tmp/output.mp3")).toEqual([
      "-hide_banner",
      "-loglevel",
      "error",
      "-nostdin",
      "-y",
      "-i",
      "/tmp/input.aiff",
      "-map_metadata",
      "-1",
      "-vn",
      "-ac",
      "1",
      "-ar",
      "44100",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "128k",
      "/tmp/output.mp3",
    ]);
  });

  it("asks ffprobe for a machine-readable duration only", () => {
    expect(buildFfprobeArgs("/tmp/output.mp3")).toEqual([
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      "/tmp/output.mp3",
    ]);
    expect(parseDurationMs("8.400000\n")).toBe(8400);
    expect(() => parseDurationMs("N/A")).toThrow("ffprobe");
  });
});

describe("local audio hashes and manifest contract", () => {
  it("creates lowercase SHA-256 digests and changes sourceHash with text or voice", () => {
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );

    const base = segmentSourceHash("月色入户。", "Tingting", 145);
    expect(base).toMatch(/^[a-f0-9]{64}$/u);
    expect(segmentSourceHash("月色入户！", "Tingting", 145)).not.toBe(base);
    expect(segmentSourceHash("月色入户。", "Meijia", 145)).not.toBe(base);
    expect(segmentSourceHash("月色入户。", "Tingting", 130)).not.toBe(base);
  });

  it("builds parser-compatible public URLs and manifest hashes", () => {
    const sourceHash = segmentSourceHash("元丰六年。", "Tingting", 145);
    const manifest = parseAudioManifest({
      version: 1,
      workId: "ji-cheng-tian-si-ye-you",
      provider: "local-pregenerated",
      voice: "Tingting-local-preview",
      format: "mp3",
      generatedAt: "2026-08-13T10:00:00.000Z",
      segments: [
        {
          id: "seg-001",
          url: segmentPublicUrl("ji-cheng-tian-si-ye-you", "seg-001"),
          durationMs: 8400,
          checksum: sha256Hex("audio-bytes"),
          sourceHash,
        },
      ],
    });

    expect(manifest.segments[0]?.url).toBe(
      "/audio/ji-cheng-tian-si-ye-you/seg-001.mp3",
    );
  });

  it("rejects unsafe work and segment IDs before URL creation", () => {
    expect(() => segmentPublicUrl("../work", "seg-001")).toThrow("workId");
    expect(() => segmentPublicUrl("safe-work", "../../secret")).toThrow("segmentId");
  });
});
