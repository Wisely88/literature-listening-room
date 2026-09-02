import "dotenv/config";

import { access } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getAllWorks } from "@/lib/content";
import {
  generateEdgeAudio,
  parseEdgeAudioArgs,
} from "./generate-edge-audio";

type BatchOptions = {
  all: boolean;
  force: boolean;
  voiceId?: string;
  voice?: string;
  rate?: string;
  pitch?: string;
};

function parseBatchArgs(argv: string[]): BatchOptions {
  let all = false;
  let force = false;
  let voiceId: string | undefined;
  let voice: string | undefined;
  let rate: string | undefined;
  let pitch: string | undefined;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--all") all = true;
    else if (argument === "--force") force = true;
    else if (argument === "--voice-id") voiceId = argv[++index];
    else if (argument === "--voice") voice = argv[++index];
    else if (argument === "--rate") rate = argv[++index];
    else if (argument === "--pitch") pitch = argv[++index];
    else throw new Error("未知参数：" + argument);
  }
  return { all, force, voiceId, voice, rate, pitch };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  const batch = parseBatchArgs(process.argv.slice(2));
  const works = await getAllWorks();
  const selected = [];

  for (const work of works) {
    const manifestPath = path.join(
      process.cwd(),
      "public",
      "audio",
      work.id,
      "manifest.json",
    );
    if (batch.all || (await exists(manifestPath))) selected.push(work);
  }

  console.log(
    "Edge 神经音频批处理：" +
      String(selected.length) +
      " 篇（" +
      (batch.all ? "全部作品" : "已有音频作品") +
      "）",
  );

  let generated = 0;
  let skipped = 0;
  for (let index = 0; index < selected.length; index += 1) {
    const work = selected[index];
    if (!work) continue;
    console.log(
      "\n[" + String(index + 1) + "/" + String(selected.length) + "] " + work.title,
    );
    const args = ["--slug", work.slug];
    if (batch.force) args.push("--force");
    if (batch.voiceId) args.push("--voice-id", batch.voiceId);
    if (batch.voice) args.push("--voice", batch.voice);
    if (batch.rate) args.push("--rate", batch.rate);
    if (batch.pitch) args.push("--pitch", batch.pitch);
    let result = false;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        result = Boolean(await generateEdgeAudio(parseEdgeAudioArgs(args)));
        break;
      } catch (error) {
        console.warn(`  第 ${attempt} 次失败：${error instanceof Error ? error.message : String(error)}`);
        if (attempt < 3) await wait(attempt * 1500);
      }
    }
    if (result) generated += 1;
    else skipped += 1;
  }

  console.log(
    "批处理完成：生成 " +
      String(generated) +
      " 篇，跳过 " +
      String(skipped) +
      " 篇。",
  );
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
