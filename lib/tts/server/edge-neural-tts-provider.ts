import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { constants as fsConstants } from "node:fs";
import { access, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { AudioFormat, TTSProvider, TTSRequest, TTSResult } from "../types";

const execFileAsync = promisify(execFile);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural";
const DEFAULT_RATE = "-12%";
const DEFAULT_PITCH = "-2Hz";

export type EdgeNeuralTTSProviderOptions = {
  publicRoot?: string;
  executable?: string;
  rate?: string;
  pitch?: string;
  timeoutMs?: number;
};

function requireSlug(value: string | undefined, field: string): string {
  if (!value || !SLUG_PATTERN.test(value)) {
    throw new Error("Edge neural TTS " + field + " must be a lowercase slug");
  }
  return value;
}

function normalizeAdjustment(value: string, pattern: RegExp, field: string): string {
  const normalized = value.trim();
  if (!pattern.test(normalized)) {
    throw new Error("Edge neural TTS " + field + " is invalid");
  }
  return normalized;
}

export function buildEdgeTtsArgs(
  inputPath: string,
  outputPath: string,
  voice: string,
  rate: string,
  pitch: string,
): string[] {
  return [
    "--voice",
    voice,
    "--rate=" + rate,
    "--pitch=" + pitch,
    "--file",
    inputPath,
    "--write-media",
    outputPath,
  ];
}

export class EdgeNeuralTTSProvider implements TTSProvider {
  readonly name = "edge-neural";
  private readonly publicRoot: string;
  private readonly executable: string;
  private readonly rate: string;
  private readonly pitch: string;
  private readonly timeoutMs: number;

  constructor(options: EdgeNeuralTTSProviderOptions = {}) {
    this.publicRoot = path.resolve(options.publicRoot ?? path.join(process.cwd(), "public"));
    this.executable = path.resolve(
      options.executable ??
        process.env.EDGE_TTS_EXECUTABLE ??
        path.join(process.cwd(), ".venv-edge-tts", "bin", "edge-tts"),
    );
    this.rate = normalizeAdjustment(
      options.rate ?? process.env.EDGE_TTS_RATE ?? DEFAULT_RATE,
      /^[+-]\d{1,2}%$/u,
      "rate",
    );
    this.pitch = normalizeAdjustment(
      options.pitch ?? process.env.EDGE_TTS_PITCH ?? DEFAULT_PITCH,
      /^[+-]\d{1,3}Hz$/u,
      "pitch",
    );
    this.timeoutMs = options.timeoutMs ?? 120_000;
  }

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    const workId = requireSlug(input.workId, "workId");
    const segmentId = requireSlug(input.segmentId, "segmentId");
    const format: AudioFormat = input.format ?? "mp3";
    if (format !== "mp3") {
      throw new Error("Edge neural TTS currently supports mp3 output only");
    }

    const text = input.text.trim();
    if (!text) throw new Error("Edge neural TTS text must not be empty");

    const voice = input.voice.trim() || DEFAULT_VOICE;
    if (!/^zh-CN-[A-Za-z]+Neural$/u.test(voice)) {
      throw new Error("Edge neural TTS requires a zh-CN neural voice");
    }

    await access(this.executable, fsConstants.X_OK);
    const relativePath = path.join("audio", workId, segmentId + "." + format);
    const filePath = path.resolve(this.publicRoot, relativePath);
    const relativeToRoot = path.relative(this.publicRoot, filePath);
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new Error("Edge neural audio path escapes public root");
    }

    await mkdir(path.dirname(filePath), { recursive: true });
    const nonce = randomUUID();
    const inputPath = path.join(path.dirname(filePath), "." + segmentId + "-" + nonce + ".txt");
    const temporaryAudio = path.join(
      path.dirname(filePath),
      "." + segmentId + "-" + nonce + ".mp3",
    );

    try {
      await writeFile(inputPath, text, { encoding: "utf8", flag: "wx" });
      await execFileAsync(
        this.executable,
        buildEdgeTtsArgs(inputPath, temporaryAudio, voice, this.rate, this.pitch),
        { timeout: this.timeoutMs, maxBuffer: 1024 * 1024 },
      );
      const audio = await readFile(temporaryAudio);
      if (audio.length < 1024) {
        throw new Error("Edge neural TTS returned an empty or invalid audio file");
      }
      await rename(temporaryAudio, filePath);
    } finally {
      await rm(inputPath, { force: true });
      await rm(temporaryAudio, { force: true });
    }

    return {
      audioUrl: "/audio/" + workId + "/" + segmentId + "." + format,
      provider: this.name,
      voice,
      format,
      sourceHash: input.sourceHash,
    };
  }
}
