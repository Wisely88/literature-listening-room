import { pathToFileURL } from "node:url";
import {
  ContentValidationError,
  getAllWorks,
  validateRightsStatus,
  type ContentMode,
  type ContentWarning,
} from "@/lib/content";
import {
  FOREIGN_LITERATURE_CATEGORY,
  isForeignLiteratureGenre,
} from "@/lib/content/foreign-literature";

export type ValidationReport = {
  works: number;
  warnings: ContentWarning[];
};

export async function validateContent(mode: ContentMode = "private"): Promise<ValidationReport> {
  const works = await getAllWorks({}, { mode });
  const warnings: ContentWarning[] = [];
  const blockingIssues: string[] = [];

  for (const work of works) {
    warnings.push(
      ...validateRightsStatus(work.rightsStatus, {
        mode,
        sourcePath: `content/works/${work.slug}.md`,
      }),
    );

    if (work.category === "古文") {
      if (work.annotations.length === 0) {
        warnings.push({
          code: "classical-work-missing-annotations",
          message: `古文《${work.title}》建议补充注释。`,
          sourcePath: `content/works/${work.slug}.annotations.json`,
        });
      }
      if (!work.translation.trim()) {
        warnings.push({
          code: "classical-work-missing-translation",
          message: `古文《${work.title}》建议补充白话译文。`,
          sourcePath: `content/works/${work.slug}.md`,
        });
      }
      if (!work.background.trim()) {
        warnings.push({
          code: "classical-work-missing-background",
          message: `古文《${work.title}》建议补充创作背景。`,
          sourcePath: `content/works/${work.slug}.md`,
        });
      }
    }

    if (work.category === FOREIGN_LITERATURE_CATEGORY) {
      if (!isForeignLiteratureGenre(work.foreignGenre)) {
        blockingIssues.push(`《${work.title}》缺少有效的外国文学题材分类。`);
      }
      const originalLength = work.segments.reduce(
        (total, segment) => total + segment.displayText.length,
        0,
      );
      const translationLength = work.translation.replace(/\s/gu, "").length;
      if (originalLength < 1800) {
        blockingIssues.push(
          `《${work.title}》原文仅 ${originalLength} 字符，外国文学长文门禁要求至少 1800 字符。`,
        );
      }
      if (translationLength < 500) {
        blockingIssues.push(
          `《${work.title}》中文译文仅 ${translationLength} 字符，外国文学译文门禁要求至少 500 字符。`,
        );
      }
    } else if (work.foreignGenre) {
      blockingIssues.push(`《${work.title}》不是外国文学，不应设置 foreignGenre。`);
    }
  }

  if (blockingIssues.length > 0) {
    throw new ContentValidationError("外国文学长文门禁失败。", blockingIssues);
  }

  return { works: works.length, warnings };
}

function printValidationError(error: unknown): void {
  if (error instanceof ContentValidationError) {
    console.error(`内容校验失败：${error.message}`);
    for (const issue of error.issues) console.error(`- ${issue}`);
    return;
  }
  console.error(error);
}

async function main(): Promise<void> {
  const mode: ContentMode = process.argv.includes("--public") ? "public" : "private";
  const report = await validateContent(mode);

  for (const warning of report.warnings) {
    const location = warning.sourcePath ? ` (${warning.sourcePath})` : "";
    console.warn(`[warning:${warning.code}] ${warning.message}${location}`);
  }

  console.log(
    `内容校验通过：${report.works} 篇作品，${report.warnings.length} 条警告，模式 ${mode}。`,
  );
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  main().catch((error: unknown) => {
    printValidationError(error);
    process.exitCode = 1;
  });
}
