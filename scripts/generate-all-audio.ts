import "dotenv/config";

import { pathToFileURL } from "node:url";
import { getAllWorks } from "@/lib/content";
import { generateLocalAudio, parseLocalAudioArgs } from "./generate-local-audio";

async function main(): Promise<void> {
  const works = await getAllWorks();
  let generated = 0;
  let skipped = 0;

  for (const work of works) {
    const options = parseLocalAudioArgs(["--slug", work.slug]);
    const manifest = await generateLocalAudio(options);
    if (manifest) {
      generated += 1;
      console.log(work.slug + "：生成 " + manifest.segments.length + " 段");
    } else {
      skipped += 1;
      console.log(work.slug + "：已是最新");
    }
  }

  console.log("完成：生成 " + generated + " 篇，跳过 " + skipped + " 篇，共 " + works.length + " 篇。");
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
