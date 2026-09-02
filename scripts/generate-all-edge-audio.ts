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
};

function parseBatchArgs(argv: string[]): BatchOptions {
  let all = false;
  let force = false;
  for (const argument of argv) {
    if (argument === "--all") all = true;
    else if (argument === "--force") force = true;
    else throw new Error("未知参数：" + argument);
  }
  return { all, force };
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
    const result = await generateEdgeAudio(parseEdgeAudioArgs(args));
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
