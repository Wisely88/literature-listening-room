import "dotenv/config";

import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { getWorkBySlug } from "@/lib/content";
import { parseAudioManifest } from "@/lib/tts/manifest";
import { TencentTTSProvider } from "@/lib/tts/server/tencent-tts-provider";
import type { AudioManifest, AudioManifestSegment } from "@/lib/tts/types";
import { parseDurationMs, segmentPublicUrl, sha256Hex } from "./generate-local-audio";

const execFileAsync = promisify(execFile);

const DEFAULT_SLUG = "ji-cheng-tian-si-ye-you";
const PROVIDER = "tencent";
const FORMAT = "mp3";
const SOURCE_HASH_VERSION = 1;

type TencentAudioCliOptions = {
  projectRoot: string;
  slug: string;
  voiceType: number;
  speed: number;
  force: boolean;
  help: boolean;
};

function tencentSourceHash(
  speechText: string,
  voiceType: number,
  speed: number,
  sampleRate: number,
): string {
  return sha256Hex(
    JSON.stringify({
      version: SOURCE_HASH_VERSION,
      provider: PROVIDER,
      format: FORMAT,
      voiceType,
      speed,
      sampleRate,
      speechText,
    }),
  );
}

function parseNumber(value: string, flag: string, min: number, max: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(flag + " 必须在 " + min + " 到 " + max + " 之间。");
  }
  return parsed;
}

export function parseTencentAudioArgs(argv: string[]): TencentAudioCliOptions {
  let slug = DEFAULT_SLUG;
  let voiceType: number | undefined;
  let speed: number | undefined;
  let force = false;
  let help = false;
  const seen = new Set<string>();

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--force" || argument === "--help") {
      if (seen.has(argument)) throw new Error("参数重复：" + argument);
      seen.add(argument);
      force = force || argument === "--force";
      help = help || argument === "--help";
      continue;
    }

    if (argument === "--slug" || argument === "--voice-type" || argument === "--speed") {
      if (seen.has(argument)) throw new Error("参数重复：" + argument);
      seen.add(argument);
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(argument + " 需要一个参数。");
      if (argument === "--slug") slug = value;
      if (argument === "--voice-type") voiceType = parseNumber(value, "voice-type", 1, 999999999);
      if (argument === "--speed") speed = parseNumber(value, "speed", -2, 6);
      index += 1;
      continue;
    }

    throw new Error("未知参数：" + argument);
  }

  return {
    projectRoot: path.resolve(process.cwd()),
    slug,
    voiceType: voiceType ?? Number(process.env.TENCENT_TTS_VOICE_TYPE ?? 101001),
    speed: speed ?? Number(process.env.TENCENT_TTS_SPEED ?? 0),
    force,
    help,
  };
}

async function existingMatches(
  manifestPath: string,
  expectedSegments: Array<{ id: string; url: string; sourceHash: string }>,
): Promise<boolean> {
  try {
    const raw = await readFile(manifestPath, "utf8");
    const manifest = parseAudioManifest(JSON.parse(raw) as unknown);
    if (manifest.provider !== PROVIDER || manifest.segments.length !== expectedSegments.length) {
      return false;
    }
    return manifest.segments.every((segment, index) => {
      const expected = expectedSegments[index];
      return (
        expected &&
        segment.id === expected.id &&
        segment.url === expected.url &&
        segment.sourceHash === expected.sourceHash
      );
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
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

export async function generateTencentAudio(
  options: TencentAudioCliOptions,
): Promise<AudioManifest | null> {
  const work = await getWorkBySlug(options.slug);
  if (!work) throw new Error("找不到作品：" + options.slug);

  const publicRoot = path.join(options.projectRoot, "public");
  const outputDirectory = path.join(publicRoot, "audio", work.id);
  const manifestPath = path.join(outputDirectory, "manifest.json");
  const sampleRate = Number(process.env.TENCENT_TTS_SAMPLE_RATE ?? 16000);

  const expectedSegments = work.segments.map((segment) => {
    const speechText = segment.speechText?.trim();
    if (!speechText) {
      throw new Error("段落 " + segment.id + " 缺少 speechText。");
    }
    return {
      id: segment.id,
      speechText,
      url: segmentPublicUrl(work.id, segment.id),
      sourceHash: tencentSourceHash(speechText, options.voiceType, options.speed, sampleRate),
    };
  });

  if (
    !options.force &&
    (await existingMatches(manifestPath, expectedSegments))
  ) {
    console.log("腾讯云音频已是最新：" + path.relative(options.projectRoot, manifestPath));
    return null;
  }

  const provider = new TencentTTSProvider({
    publicRoot,
    voiceType: options.voiceType,
    speed: options.speed,
    sampleRate,
  });

  const generatedSegments: AudioManifestSegment[] = [];
  for (const segment of expectedSegments) {
    await provider.synthesize({
      text: segment.speechText,
      voice: String(options.voiceType),
      format: "mp3",
      workId: work.id,
      segmentId: segment.id,
      sourceHash: segment.sourceHash,
    });

    const filePath = path.join(outputDirectory, segment.id + ".mp3");
    const [durationMs, audio] = await Promise.all([
      probeDuration(filePath),
      readFile(filePath),
    ]);
    generatedSegments.push({
      id: segment.id,
      url: segment.url,
      durationMs,
      checksum: sha256Hex(audio),
      sourceHash: segment.sourceHash,
    });
  }

  const manifest = parseAudioManifest({
    version: 1,
    workId: work.id,
    provider: PROVIDER,
    voice: String(options.voiceType),
    format: FORMAT,
    generatedAt: new Date().toISOString(),
    segments: generatedSegments,
  });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return manifest;
}

function printHelp(): void {
  console.log(`
用法：tsx scripts/generate-tencent-audio.ts [options]

选项：
  --slug <slug>          作品 slug（默认 ${DEFAULT_SLUG}）
  --voice-type <number>  腾讯云音色 ID（默认 TENCENT_TTS_VOICE_TYPE 或 101001）
  --speed <number>       语速（-2 到 6，默认 TENCENT_TTS_SPEED 或 0）
  --force                覆盖已有音频
  --help                 显示帮助
`);
}

async function main(): Promise<void> {
  const options = parseTencentAudioArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  const manifest = await generateTencentAudio(options);
  if (manifest) {
    console.log(
      "腾讯云预生成音频完成：" +
        manifest.segments.length +
        " 段，音色 " +
        manifest.voice +
        "，provider " +
        manifest.provider,
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
