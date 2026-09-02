import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import tencentcloud from "tencentcloud-sdk-nodejs-tts";
import type { AudioFormat, TTSProvider, TTSRequest, TTSResult } from "../types";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const TtsClient = tencentcloud.tts.v20190823.Client;

// 该模块只在服务端脚本与未来的服务端 API 使用，勿从 Client Component 导入：
// 它依赖 Node 文件系统与腾讯云凭据，天然只能在 Node 环境运行。

export type TencentTTSProviderOptions = {
  publicRoot?: string;
  voiceType?: number;
  speed?: number;
  sampleRate?: number;
};

function requireSlug(value: string | undefined, field: string): string {
  if (!value || !slugPattern.test(value)) {
    throw new Error(`Tencent TTS ${field} must be a lowercase slug`);
  }
  return value;
}

function requireSecret(value: string | undefined, name: string): string {
  if (!value || !value.trim()) {
    throw new Error(`缺少腾讯云凭据：${name}。请在 .env 中配置 TENCENTCLOUD_SECRET_ID 与 TENCENTCLOUD_SECRET_KEY。`);
  }
  return value;
}

export class TencentTTSProvider implements TTSProvider {
  readonly name = "tencent";
  private readonly publicRoot: string;
  private readonly voiceType: number;
  private readonly speed: number;
  private readonly sampleRate: number;
  private readonly client: InstanceType<typeof TtsClient>;

  constructor(options: TencentTTSProviderOptions = {}) {
    this.publicRoot = path.resolve(options.publicRoot ?? path.join(process.cwd(), "public"));
    this.voiceType = options.voiceType ?? Number(process.env.TENCENT_TTS_VOICE_TYPE ?? 101001);
    this.speed = options.speed ?? Number(process.env.TENCENT_TTS_SPEED ?? 0);
    this.sampleRate = options.sampleRate ?? Number(process.env.TENCENT_TTS_SAMPLE_RATE ?? 16000);

    this.client = new TtsClient({
      credential: {
        secretId: requireSecret(process.env.TENCENTCLOUD_SECRET_ID, "SecretId"),
        secretKey: requireSecret(process.env.TENCENTCLOUD_SECRET_KEY, "SecretKey"),
      },
      region: process.env.TENCENTCLOUD_REGION?.trim() || "ap-guangzhou",
      profile: {
        httpProfile: { endpoint: "tts.tencentcloudapi.com" },
      },
    });
  }

  async synthesize(input: TTSRequest): Promise<TTSResult> {
    const workId = requireSlug(input.workId, "workId");
    const segmentId = requireSlug(input.segmentId, "segmentId");
    const format: AudioFormat = input.format ?? "mp3";
    if (format !== "mp3" && format !== "wav") {
      throw new Error("Tencent TTS 仅支持 mp3 或 wav 输出。");
    }

    const text = input.text.trim();
    if (!text) throw new Error("合成文本不能为空。");

    const response = await this.client.TextToVoice({
      Text: text,
      SessionId: randomUUID(),
      VoiceType: this.voiceType,
      Codec: format,
      SampleRate: this.sampleRate,
      Speed: input.rate ?? this.speed,
      Volume: Number(process.env.TENCENT_TTS_VOLUME ?? 0),
      PrimaryLanguage: 1,
    });

    if (!response.Audio) {
      throw new Error(`腾讯云 TTS 返回了空音频（RequestId: ${response.RequestId ?? "未知"}）。`);
    }

    const audio = Buffer.from(response.Audio, "base64");
    const relativePath = path.join("audio", workId, `${segmentId}.${format}`);
    const filePath = path.resolve(this.publicRoot, relativePath);
    const relativeToRoot = path.relative(this.publicRoot, filePath);
    if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
      throw new Error("Tencent audio path escapes public root");
    }

    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, audio);

    return {
      audioUrl: `/audio/${workId}/${segmentId}.${format}`,
      provider: this.name,
      voice: String(this.voiceType),
      format,
      sourceHash: input.sourceHash,
    };
  }
}
