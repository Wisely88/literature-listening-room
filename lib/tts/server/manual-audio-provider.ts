import "server-only";

import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { AudioFormat, TTSProvider, TTSRequest, TTSResult } from "../types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type ManualAudioProviderOptions = {
  publicRoot?: string;
  provider?: string;
};

export type RegisterManualAudioInput = {
  sourcePath: string;
  workId: string;
  segmentId: string;
  format?: AudioFormat;
};

/**
 * Resolves or registers audio that was pre-generated outside the application.
 * Keep this module server-only: it reads from the filesystem and must never be
 * imported by a Client Component.
 */
export class ManualAudioProvider implements TTSProvider {
  readonly name: string;
  private readonly publicRoot: string;

  constructor(options: ManualAudioProviderOptions = {}) {
    this.name = options.provider ?? "local-pregenerated";
    this.publicRoot = path.resolve(options.publicRoot ?? path.join(process.cwd(), "public"));
  }

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    const workId = requireSlug(input.workId, "workId");
    const segmentId = requireSlug(input.segmentId, "segmentId");
    const format = input.format ?? "mp3";
    const voice = input.voice.trim();
    if (!voice) throw new Error("Manual audio voice must not be empty");
    const { filePath, audioUrl } = this.resolveDestination(workId, segmentId, format);

    await access(filePath);

    return {
      audioUrl,
      provider: this.name,
      voice,
      format,
      sourceHash: input.sourceHash,
    };
  }

  async register(input: RegisterManualAudioInput): Promise<string> {
    const workId = requireSlug(input.workId, "workId");
    const segmentId = requireSlug(input.segmentId, "segmentId");
    const format = input.format ?? inferAudioFormat(input.sourcePath);
    const sourceFormat = inferAudioFormat(input.sourcePath);
    if (format !== sourceFormat) {
      throw new Error(`Manual audio format ${format} does not match source file ${sourceFormat}`);
    }
    const sourcePath = path.resolve(input.sourcePath);
    const { filePath, audioUrl } = this.resolveDestination(workId, segmentId, format);

    await access(sourcePath);
    if (sourcePath === filePath) {
      return audioUrl;
    }

    await mkdir(path.dirname(filePath), { recursive: true });
    await copyFile(sourcePath, filePath);
    return audioUrl;
  }

  private resolveDestination(workId: string, segmentId: string, format: AudioFormat) {
    const relativePath = path.join("audio", workId, `${segmentId}.${format}`);
    const filePath = path.resolve(this.publicRoot, relativePath);
    const relativeToRoot = path.relative(this.publicRoot, filePath);

    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new Error("Manual audio path escapes public root");
    }

    return {
      filePath,
      audioUrl: `/audio/${workId}/${segmentId}.${format}`,
    };
  }
}

function requireSlug(value: string | undefined, field: string): string {
  if (!value || !slugPattern.test(value)) {
    throw new Error(`Manual audio ${field} must be a lowercase slug`);
  }
  return value;
}

function inferAudioFormat(sourcePath: string): AudioFormat {
  const extension = path.extname(sourcePath).toLowerCase();
  if (extension === ".mp3") return "mp3";
  if (extension === ".wav") return "wav";
  throw new Error("Manual audio source must be an mp3 or wav file");
}
