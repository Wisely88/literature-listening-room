export const AUDIO_FORMATS = ["mp3", "wav"] as const;

export type AudioFormat = (typeof AUDIO_FORMATS)[number];

export type TTSRequest = {
  text: string;
  voice: string;
  rate?: number;
  pitch?: number;
  style?: string;
  format?: AudioFormat;
  workId?: string;
  segmentId?: string;
  sourceHash?: string;
};

export type TTSResult = {
  audioUrl: string;
  durationMs?: number;
  provider: string;
  voice: string;
  format: AudioFormat;
  checksum?: string;
  sourceHash?: string;
};

/**
 * Server-side providers generate or resolve a stable, pre-generated audio URL.
 * Browser speech intentionally does not implement this interface because it is
 * an explicit fallback, not a formal audio asset.
 */
export interface TTSProvider {
  readonly name: string;
  synthesize(input: TTSRequest): Promise<TTSResult>;
}

export type AudioManifestSegment = {
  id: string;
  url: string;
  durationMs?: number;
  checksum?: string;
  sourceHash?: string;
};

export type AudioManifest = {
  version: 1;
  workId: string;
  provider: string;
  voice: string;
  voiceId?: string;
  format: AudioFormat;
  generatedAt?: string;
  segments: AudioManifestSegment[];
};
