import "dotenv/config";

import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { getWorkBySlug } from "@/lib/content";
import { narrationTextForSegment } from "@/lib/tts/narration-text";
import { parseAudioManifest } from "@/lib/tts/manifest";
import { EdgeNeuralTTSProvider } from "@/lib/tts/server/edge-neural-tts-provider";
import type { AudioManifest, AudioManifestSegment } from "@/lib/tts/types";
import { parseDurationMs } from "./generate-local-audio";

const execFileAsync = promisify(execFile);
const DEFAULT_SLUG = "ji-cheng-tian-si-ye-you";
const DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural";
const DEFAULT_RATE = "-12%";
const DEFAULT_PITCH = "-2Hz";
const PROVIDER = "edge-neural";
const FORMAT = "mp3";
const SOURCE_HASH_VERSION = 2;

export type EdgeAudioCliOptions = {
  projectRoot: string;
  slug: string;
  voice: string;
  rate: string;
  pitch: string;
  voiceId?: string;
  executable: string;
  force: boolean;
  help: boolean;
};

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function requireValue(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(flag + " 需要一个参数。");
  return value;
}

function normalizeVoice(value: string): string {
  const voice = value.trim();
  if (!/^zh-CN-[A-Za-z]+Neural$/u.test(voice)) {
    throw new Error("voice 必须是 zh-CN 神经音色。");
  }
  return voice;
}

function normalizeRate(value: string): string {
  if (!/^[+-]\d{1,2}%$/u.test(value.trim())) throw new Error("rate 格式应为 -12% 之类。");
  return value.trim();
}

function normalizePitch(value: string): string {
  if (!/^[+-]\d{1,3}Hz$/u.test(value.trim())) throw new Error("pitch 格式应为 -2Hz 之类。");
  return value.trim();
}

export function parseEdgeAudioArgs(argv: string[], cwd = process.cwd()): EdgeAudioCliOptions {
  let slug = DEFAULT_SLUG;
  let voice = process.env.EDGE_TTS_VOICE ?? DEFAULT_VOICE;
  let rate = process.env.EDGE_TTS_RATE ?? DEFAULT_RATE;
  let pitch = process.env.EDGE_TTS_PITCH ?? DEFAULT_PITCH;
  let voiceId: string | undefined;
  let executable =
    process.env.EDGE_TTS_EXECUTABLE ?? path.join(cwd, ".venv-edge-tts", "bin", "edge-tts");
  let force = false;
  let help = false;
  const seen = new Set<string>();

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--force" || argument === "--help") {
      if (seen.has(argument)) throw new Error("参数重复：" + argument);
      seen.add(argument);
      if (argument === "--force") force = true;
      if (argument === "--help") help = true;
      continue;
    }
    if (
      argument === "--slug" ||
      argument === "--voice" ||
      argument === "--rate" ||
      argument === "--pitch" ||
      argument === "--voice-id" ||
      argument === "--executable"
    ) {
      if (seen.has(argument)) throw new Error("参数重复：" + argument);
      seen.add(argument);
      const value = requireValue(argv, index, argument);
      if (argument === "--slug") slug = value;
      if (argument === "--voice") voice = value;
      if (argument === "--rate") rate = value;
      if (argument === "--pitch") pitch = value;
      if (argument === "--voice-id") voiceId = value;
      if (argument === "--executable") executable = value;
      index += 1;
      continue;
    }
    throw new Error("未知参数：" + argument);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) throw new Error("slug 不合法。");
  if (voiceId && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(voiceId)) throw new Error("voice-id 不合法。");
  return {
    projectRoot: path.resolve(cwd),
    slug,
    voice: normalizeVoice(voice),
    rate: normalizeRate(rate),
    pitch: normalizePitch(pitch),
    voiceId,
    executable: path.resolve(executable),
    force,
    help,
  };
}

function sourceHash(text: string, options: EdgeAudioCliOptions): string {
  return sha256(
    JSON.stringify({
      version: SOURCE_HASH_VERSION,
      provider: PROVIDER,
      format: FORMAT,
      voice: options.voice,
      rate: options.rate,
      pitch: options.pitch,
      text,
    }),
  );
}

async function probeDuration(filePath: string): Promise<number> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath,
  ]);
  return parseDurationMs(stdout);
}

function audioFileName(segmentId: string, voiceId?: string): string {
  return voiceId ? segmentId + "-voice-" + voiceId + ".mp3" : segmentId + ".mp3";
}

async function existingMatches(
  manifestPath: string,
  outputDirectory: string,
  voiceLabel: string,
  expected: Array<{ id: string; sourceHash: string }>,
  voiceId?: string,
): Promise<boolean> {
  try {
    const manifest = parseAudioManifest(JSON.parse(await readFile(manifestPath, "utf8")));
    if (
      manifest.provider !== PROVIDER ||
      manifest.voice !== voiceLabel ||
      manifest.segments.length !== expected.length
    ) {
      return false;
    }
    for (let index = 0; index < expected.length; index += 1) {
      const wanted = expected[index];
      const actual = manifest.segments[index];
      if (!wanted || !actual || actual.id !== wanted.id || actual.sourceHash !== wanted.sourceHash) {
        return false;
      }
      const audio = await readFile(path.join(outputDirectory, audioFileName(actual.id, voiceId)));
      if (!actual.checksum || actual.checksum !== sha256(audio)) return false;
    }
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export async function generateEdgeAudio(
  options: EdgeAudioCliOptions,
): Promise<AudioManifest | null> {
  const work = await getWorkBySlug(options.slug);
  if (!work) throw new Error("找不到作品：" + options.slug);
  if (!work.segments.length) throw new Error("作品没有可朗读段落：" + options.slug);

  const publicRoot = path.join(options.projectRoot, "public");
  const outputDirectory = path.join(publicRoot, "audio", work.id);
  const manifestPath = path.join(outputDirectory, options.voiceId ? "manifest-" + options.voiceId + ".json" : "manifest.json");
  const voiceLabel = options.voice + "|rate=" + options.rate + "|pitch=" + options.pitch + (options.voiceId ? "|voiceId=" + options.voiceId : "");
  const expected = work.segments.map((segment) => {
    const text = narrationTextForSegment(work, segment);
    return { id: segment.id, text, sourceHash: sourceHash(text, options) };
  });

  if (
    !options.force &&
    (await existingMatches(manifestPath, outputDirectory, voiceLabel, expected, options.voiceId))
  ) {
    console.log("Edge 神经音频已是最新：" + options.slug);
    return null;
  }

  const storageAudio = path.join(options.projectRoot, "storage", "audio");
  await mkdir(storageAudio, { recursive: true });
  const stageRoot = await mkdtemp(path.join(storageAudio, "edge-build-"));
  const provider = new EdgeNeuralTTSProvider({
    publicRoot: stageRoot,
    executable: options.executable,
    rate: options.rate,
    pitch: options.pitch,
  });

  try {
    const segments: AudioManifestSegment[] = [];
    for (let index = 0; index < expected.length; index += 1) {
      const segment = expected[index];
      if (!segment) continue;
      console.log(
        "  合成 " + String(index + 1) + "/" + String(expected.length) + "：" + segment.id,
      );
      const result = await provider.synthesize({
        text: segment.text,
        voice: options.voice,
        format: "mp3",
        workId: work.id,
        segmentId: audioFileName(segment.id, options.voiceId).slice(0, -4),
        sourceHash: segment.sourceHash,
      });
      const stagedFile = path.join(stageRoot, "audio", work.id, audioFileName(segment.id, options.voiceId));
      const audio = await readFile(stagedFile);
      segments.push({
        id: segment.id,
        url: result.audioUrl,
        durationMs: await probeDuration(stagedFile),
        checksum: sha256(audio),
        sourceHash: segment.sourceHash,
      });
    }

    const manifest = parseAudioManifest({
      version: 1,
      workId: work.id,
      provider: PROVIDER,
      voice: voiceLabel,
      format: FORMAT,
      generatedAt: new Date().toISOString(),
      voiceId: options.voiceId,
      segments,
    });

    await mkdir(outputDirectory, { recursive: true });
    for (const segment of segments) {
      await rename(
        path.join(stageRoot, "audio", work.id, audioFileName(segment.id, options.voiceId)),
        path.join(outputDirectory, audioFileName(segment.id, options.voiceId)),
      );
    }
    const temporaryManifest = path.join(
      outputDirectory,
      ".manifest-" + randomUUID() + ".json",
    );
    await writeFile(temporaryManifest, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    await rename(temporaryManifest, manifestPath);
    return manifest;
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
  }
}

function printHelp(): void {
  console.log(
    [
      "用法：tsx scripts/generate-edge-audio.ts [options]",
      "",
      "  --slug <slug>       作品 slug",
      "  --voice <name>      默认 zh-CN-XiaoxiaoNeural",
      "  --rate <-12%>       默认 -12%",
      "  --pitch <-2Hz>      默认 -2Hz",
      "  --voice-id <id>    变体标识，如 story-male",
      "  --executable <path> edge-tts 路径",
      "  --force             原子覆盖旧音频",
      "  --help              显示帮助",
    ].join("\n"),
  );
}

async function main(): Promise<void> {
  const options = parseEdgeAudioArgs(process.argv.slice(2));
  if (options.help) return printHelp();
  const manifest = await generateEdgeAudio(options);
  if (manifest) {
    console.log(
      "自然神经音频完成：" +
        manifest.workId +
        "，" +
        String(manifest.segments.length) +
        " 段，" +
        manifest.voice,
    );
  }
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
