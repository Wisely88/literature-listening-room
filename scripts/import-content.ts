import { pathToFileURL } from "node:url";
import { prisma } from "@/lib/db/client";
import { seedAllWorks } from "@/prisma/seed";

export async function importContent(): Promise<void> {
  const summary = await seedAllWorks();
  console.log(
    `内容导入完成：${summary.works} 篇作品，${summary.authors} 位作者，${summary.segments} 个段落，${summary.annotations} 条注释。`,
  );
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  importContent()
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
