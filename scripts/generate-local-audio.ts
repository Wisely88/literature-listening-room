import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { getWorkBySlug, type Segment } from "@/lib/content";
import { parseAudioManifest } from "@/lib/tts/manifest";
import type { AudioManifest, AudioManifestSegment } from "@/lib/tts/types";

const DEFAULT_SLUG = "ji-cheng-tian-si-ye-you";
const DEFAULT_SAY_VOICE = "Tingting";
const DEFAULT_SAY_RATE = 145;
const PROVIDER = "local-pregenerated";
const FORMAT = "mp3";
const SOURCE_HASH_VERSION = 1;
const COMMAND_TIMEOUT_MS = 120_000;
const SAFE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export type LocalAudioCliOptions = {
  projectRoot: string;
  slug: string;
  outputDirectory: string;
  sayVoice: string;
  sayRate: number;
  manifestVoice: string;
  force: boolean;
  help: boolean;
};

export type ProcessResult = {
  stdout: string;
  stderr: string;
};

type CompleteAudioManifestSegment = AudioManifestSegment & {
  durationMs: number;
  checksum: string;
  sourceHash: string;
};

type ToolPaths = {
  say: string;
  ffmpeg: string;
  ffprobe: string;
};

type LocalAudioEnvironment = Readonly<Record<string, string | undefined>>;

function cliValue(argv: string[], index: number, flag: string): { value: string; used: number } {
  const argument = argv[index];
  if (argument === flag) {
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`${flag} 需要一个参数。`);
    }
    return { value, used: 2 };
  }

  const prefix = `${flag}=`;
  if (argument?.startsWith(prefix)) {
    const value = argument.slice(prefix.length);
    if (!value) throw new Error(`${flag} 需要一个参数。`);
    return { value, used: 1 };
  }

  throw new Error(`未知参数：${argument ?? flag}`);
}

function assertSafeIdentifier(value: string, label: string): string {
  const normalized = value.trim();
  if (!SAFE_ID_PATTERN.test(normalized)) {
    throw new Error(`${label} 只能使用小写英文、数字和单个连字号分隔的片段。`);
  }
  return normalized;
}

function normalizeVoice(value: string): string {
  const normalized = value.trim();
  if (!normalized || normalized.length > 100 || /[\u0000-\u001f\u007f]/u.test(normalized)) {
    throw new Error("本地朗读音色不合法。");
  }
  return normalized;
}

function normalizeRate(value: number): number {
  if (!Number.isInteger(value) || value < 90 || value > 300) {
    throw new Error("本地朗读语速必须在 90 到 300 之间。");
  }
  return value;
}

export function isPathInside(parentDirectory: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(parentDirectory), path.resolve(candidate));
  return relative !== "" && !relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative);
}

export function resolveSafeOutputDirectory(
  projectRoot: string,
  rawOutput: string,
): string {
  if (!rawOutput.trim() || rawOutput.includes("\0") || rawOutput.includes("\\")) {
    throw new Error("输出路径不合法。");
  }

  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, rawOutput);
  if (!isPathInside(root, resolved)) {
    throw new Error("输出目录必须位于项目根目录内，且不能是项目根目录。");
  }
  return resolved;
}

async function assertRealOutputInsideProject(
  projectRoot: string,
  outputDirectory: string,
): Promise<void> {
  const realProjectRoot = await realpath(projectRoot);
  let existingAncestor = outputDirectory;

  while (true) {
    try {
      const realAncestor = await realpath(existingAncestor);
      if (
        realAncestor !== realProjectRoot &&
        !isPathInside(realProjectRoot, realAncestor)
      ) {
        throw new Error("输出路径通过符号链接指向了项目根目录之外。");
      }
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = path.dirname(existingAncestor);
      if (parent === existingAncestor) throw error;
      existingAncestor = parent;
    }
  }
}

export function parseLocalAudioArgs(
  argv: string[],
  env: LocalAudioEnvironment = process.env,
  cwd = process.cwd(),
): LocalAudioCliOptions {
  let slug = DEFAULT_SLUG;
  let output: string | undefined;
  let voice: string | undefined;
  let rate: string | undefined;
  let force = false;
  let help = false;
  const seen = new Set<string>();

  for (let index = 0; index < argv.length; ) {
    const argument = argv[index];
    if (argument === "--force" || argument === "--help") {
      const key = argument.slice(2);
      if (seen.has(key)) throw new Error(`参数重复：${argument}`);
      seen.add(key);
      force = force || argument === "--force";
      help = help || argument === "--help";
      index += 1;
      continue;
    }

    const supported = ["--slug", "--output", "--voice", "--rate"].find(
      (flag) => argument === flag || argument?.startsWith(`${flag}=`),
    );
    if (!supported) throw new Error(`未知参数：${argument ?? ""}`);
    const key = supported.slice(2);
    if (seen.has(key)) throw new Error(`参数重复：${supported}`);
    seen.add(key);
    const parsed = cliValue(argv, index, supported);
    if (supported === "--slug") slug = parsed.value;
    if (supported === "--output") output = parsed.value;
    if (supported === "--voice") voice = parsed.value;
    if (supported === "--rate") rate = parsed.value;
    index += parsed.used;
  }

  const safeSlug = assertSafeIdentifier(slug, "slug");
  const sayVoice = normalizeVoice(voice ?? env.LOCAL_TTS_VOICE ?? DEFAULT_SAY_VOICE);
  const sayRate = normalizeRate(Number(rate ?? env.LOCAL_TTS_RATE ?? DEFAULT_SAY_RATE));
  const projectRoot = path.resolve(cwd);
  const defaultOutput = path.join("public", "audio", safeSlug);

  return {
    projectRoot,
    slug: safeSlug,
    outputDirectory: resolveSafeOutputDirectory(projectRoot, output ?? defaultOutput),
    sayVoice,
    sayRate,
    manifestVoice: sayVoice + "-r" + sayRate + "-local-preview",
    force,
    help,
  };
}

export function buildSayArgs(
  inputPath: string,
  outputPath: string,
  voice: string,
  rate: number,
): string[] {
  return ["-v", voice, "-r", String(rate), "-o", outputPath, "-f", inputPath];
}

export function buildFfmpegArgs(inputPath: string, outputPath: string): string[] {
  return [
    "-hide_banner",
    "-loglevel",
    "error",
    "-nostdin",
    "-y",
    "-i",
    inputPath,
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
    outputPath,
  ];
}

export function buildFfprobeArgs(audioPath: string): string[] {
  return [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    audioPath,
  ];
}

export function sha256Hex(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function segmentSourceHash(speechText: string, sayVoice: string, sayRate: number): string {
  return sha256Hex(
    JSON.stringify({
      version: SOURCE_HASH_VERSION,
      provider: PROVIDER,
      format: FORMAT,
      codec: "libmp3lame-128k-mono-44100hz",
      voice: sayVoice,
      rate: sayRate,
      speechText,
    }),
  );
}

export function segmentPublicUrl(workId: string, segmentId: string): string {
  const safeWorkId = assertSafeIdentifier(workId, "workId");
  const safeSegmentId = assertSafeIdentifier(segmentId, "segmentId");
  return `/audio/${safeWorkId}/${safeSegmentId}.mp3`;
}

export function parseDurationMs(stdout: string): number {
  const seconds = Number(stdout.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) {
    throw new Error(`ffprobe 返回了无效时长：${stdout.trim() || "<empty>"}`);
  }
  return Math.max(1, Math.round(seconds * 1000));
}

async function resolveExecutable(command: string, env: LocalAudioEnvironment): Promise<string> {
  if (!command || command.includes("\0")) throw new Error("命令路径不合法。");
  const candidates = command.includes(path.sep)
    ? [path.resolve(command)]
    : (env.PATH ?? "")
        .split(path.delimiter)
        .filter(Boolean)
        .map((directory) => path.resolve(directory, command));

  for (const candidate of candidates) {
    try {
      await access(candidate, fsConstants.X_OK);
      return candidate;
    } catch {
      // Continue searching PATH.
    }
  }
  throw new Error(`找不到可执行命令：${command}`);
}

async function resolveTools(env: LocalAudioEnvironment): Promise<ToolPaths> {
  const [say, ffmpeg, ffprobe] = await Promise.all([
    resolveExecutable(env.LOCAL_TTS_SAY_PATH ?? "/usr/bin/say", env),
    resolveExecutable(env.FFMPEG_PATH ?? "ffmpeg", env),
    resolveExecutable(env.FFPROBE_PATH ?? "ffprobe", env),
  ]);
  return { say, ffmpeg, ffprobe };
}

async function runCommand(
  executable: string,
  args: readonly string[],
  timeoutMs = COMMAND_TIMEOUT_MS,
): Promise<ProcessResult> {
  return await new Promise<ProcessResult>((resolve, reject) => {
    const child = spawn(executable, args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      if (!settled) {
        settled = true;
        reject(new Error(`命令超时（${timeoutMs}ms）：${path.basename(executable)}`));
      }
    }, timeoutMs);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      if (code !== 0) {
        reject(
          new Error(
            `${path.basename(executable)} 执行失败（code=${String(code)}, signal=${signal ?? "none"}）${
              stderr.trim() ? `：${stderr.trim()}` : ""
            }`,
          ),
        );
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

function addReadingPauses(text: string): string {
  return text
    .replace(/([。！？；])/g, "$1[[slnc 380]]")
    .replace(/([，、：])/g, "$1[[slnc 160]]");
}

function speechTextFor(segment: Segment): string {
  const speechText = segment.speechText?.trim();
  if (!speechText) throw new Error(`段落 ${segment.id} 缺少 speechText，不能生成正式预生成音频。`);
  return addReadingPauses(speechText);
}

async function existingOutputMatches(
  manifestPath: string,
  outputDirectory: string,
  expected: Omit<AudioManifest, "generatedAt" | "segments"> & {
    segments: Array<Pick<AudioManifestSegment, "id" | "url" | "sourceHash">>;
  },
): Promise<boolean> {
  let manifest: AudioManifest;
  try {
    manifest = parseAudioManifest(JSON.parse(await readFile(manifestPath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }

  if (
    manifest.version !== expected.version ||
    manifest.workId !== expected.workId ||
    manifest.provider !== expected.provider ||
    manifest.voice !== expected.voice ||
    manifest.format !== expected.format ||
    manifest.segments.length !== expected.segments.length
  ) {
    return false;
  }

  for (let index = 0; index < manifest.segments.length; index += 1) {
    const actual = manifest.segments[index];
    const wanted = expected.segments[index];
    if (
      !actual ||
      !wanted ||
      actual.id !== wanted.id ||
      actual.url !== wanted.url ||
      actual.sourceHash !== wanted.sourceHash ||
      !actual.checksum ||
      !actual.durationMs
    ) {
      return false;
    }
    try {
      const checksum = sha256Hex(await readFile(path.join(outputDirectory, `${actual.id}.mp3`)));
      if (checksum !== actual.checksum) return false;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
      throw error;
    }
  }

  return true;
}

async function anyTargetExists(outputDirectory: string, segmentIds: string[]): Promise<boolean> {
  for (const filename of ["manifest.json", ...segmentIds.map((id) => `${id}.mp3`)]) {
    try {
      await access(path.join(outputDirectory, filename));
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return false;
}

export async function generateLocalAudio(options: LocalAudioCliOptions): Promise<AudioManifest | null> {
  const outputDirectory = resolveSafeOutputDirectory(
    options.projectRoot,
    options.outputDirectory,
  );
  await assertRealOutputInsideProject(options.projectRoot, outputDirectory);
  const work = await getWorkBySlug(options.slug);
  if (!work) throw new Error(`找不到作品：${options.slug}`);
  if (work.segments.length === 0) throw new Error(`作品《${work.title}》没有可朗读段落。`);

  const expectedSegments = work.segments.map((segment) => {
    const speechText = speechTextFor(segment);
    return {
      id: assertSafeIdentifier(segment.id, "segmentId"),
      speechText,
      url: segmentPublicUrl(work.id, segment.id),
      sourceHash: segmentSourceHash(speechText, options.sayVoice, options.sayRate),
    };
  });
  const manifestPath = path.join(outputDirectory, "manifest.json");
  const expectedManifest = {
    version: 1 as const,
    workId: work.id,
    provider: PROVIDER,
    voice: options.manifestVoice,
    format: "mp3" as const,
    segments: expectedSegments.map(({ id, url, sourceHash }) => ({ id, url, sourceHash })),
  };

  if (!options.force) {
    if (await existingOutputMatches(manifestPath, outputDirectory, expectedManifest)) {
      console.log(`本地音频已是最新：${path.relative(options.projectRoot, manifestPath)}`);
      return null;
    }
    if (await anyTargetExists(outputDirectory, expectedSegments.map(({ id }) => id))) {
      throw new Error("输出目录存在不匹配或不完整的音频；核对后使用 --force 重新生成。");
    }
  }

  const tools = await resolveTools(process.env);
  await mkdir(outputDirectory, { recursive: true });
  const temporaryDirectory = await mkdtemp(path.join(outputDirectory, ".local-audio-build-"));

  try {
    const generatedSegments: CompleteAudioManifestSegment[] = [];
    for (const segment of expectedSegments) {
      const inputPath = path.join(temporaryDirectory, `${segment.id}.txt`);
      const aiffPath = path.join(temporaryDirectory, `${segment.id}.aiff`);
      const mp3Path = path.join(temporaryDirectory, `${segment.id}.mp3`);
      await writeFile(inputPath, segment.speechText, { encoding: "utf8", flag: "wx" });
      await runCommand(tools.say, buildSayArgs(inputPath, aiffPath, options.sayVoice, options.sayRate));
      await runCommand(tools.ffmpeg, buildFfmpegArgs(aiffPath, mp3Path));
      const probe = await runCommand(tools.ffprobe, buildFfprobeArgs(mp3Path));
      const audio = await readFile(mp3Path);
      generatedSegments.push({
        id: segment.id,
        url: segment.url,
        durationMs: parseDurationMs(probe.stdout),
        checksum: sha256Hex(audio),
        sourceHash: segment.sourceHash,
      });
    }

    for (const segment of generatedSegments) {
      await rename(
        path.join(temporaryDirectory, `${segment.id}.mp3`),
        path.join(outputDirectory, `${segment.id}.mp3`),
      );
    }

    const manifest = parseAudioManifest({
      version: 1,
      workId: work.id,
      provider: PROVIDER,
      voice: options.manifestVoice,
      format: FORMAT,
      generatedAt: new Date().toISOString(),
      segments: generatedSegments,
    });
    const temporaryManifest = path.join(temporaryDirectory, "manifest.json");
    await writeFile(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
    await rename(temporaryManifest, manifestPath);
    return manifest;
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

function printHelp(): void {
  console.log(`
用法：tsx scripts/generate-local-audio.ts [options]

选项：
  --slug <slug>      作品 slug（默认 ${DEFAULT_SLUG}）
  --output <path>    项目内输出目录（默认 public/audio/<slug>）
  --voice <name>     macOS say 音色（默认 LOCAL_TTS_VOICE 或 ${DEFAULT_SAY_VOICE}）
  --rate <number>    朗读语速（90-300，默认 ${DEFAULT_SAY_RATE}）
  --force            覆盖不匹配或不完整的目标文件
  --help             显示帮助

工具路径可通过 LOCAL_TTS_SAY_PATH、FFMPEG_PATH、FFPROBE_PATH 配置。
`);
}

async function main(): Promise<void> {
  const options = parseLocalAudioArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  const manifest = await generateLocalAudio(options);
  if (manifest) {
    console.log(
      `本地预生成音频完成：${manifest.segments.length} 段，${path.relative(
        options.projectRoot,
        path.join(options.outputDirectory, "manifest.json"),
      )}`,
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
