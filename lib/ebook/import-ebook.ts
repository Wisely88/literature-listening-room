import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { LIBRARY_CATEGORIES } from "@/components/library/library-options";
import { parseAuthorJson, parseWorkMarkdown } from "@/lib/content/parser";
import { seedWork } from "@/prisma/seed";

const importRequestSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u).max(120),
  title: z.string().trim().min(1).max(160),
  author: z.string().trim().max(120).default(""),
  category: z.string().trim().refine(
    (value) => LIBRARY_CATEGORIES.some((category) => category === value),
    "分类不在书架范围内。",
  ),
  rightsStatus: z.enum(["user-owned", "personal-reference"]),
  sourceFormat: z.enum(["epub", "txt", "md"]),
  text: z.string().trim().min(20).max(1_500_000),
});

export type EbookImportRequest = z.infer<typeof importRequestSchema>;

function yamlString(value: string): string {
  return JSON.stringify(value);
}

function safeParagraphs(text: string): string[] {
  return text
    .replace(/\r\n?/gu, "\n")
    .replace(/\0/gu, "")
    .split(/\n\s*\n/gu)
    .map((paragraph) =>
      paragraph
        .replace(/^\s*##/gmu, "＃＃")
        .replace(/[ \t]+/gu, " ")
        .trim(),
    )
    .filter(Boolean);
}

function authorRecord(authorName: string) {
  const name = authorName || "私人导入";
  const suffix = createHash("sha256").update(name).digest("hex").slice(0, 12);
  const id = "private-author-" + suffix;
  return {
    id,
    slug: id,
    name,
    aliases: [],
    courtesyNames: [],
    bio: "该作者信息来自私人电子书导入，尚待进一步整理。",
    timeline: [],
    representativeWorks: [],
    relatedPeople: [],
  };
}

function buildMarkdown(input: EbookImportRequest, authorId: string, paragraphs: string[]): string {
  const estimatedMinutes = Math.max(1, Math.ceil(input.text.length / 260));
  const summary = "由用户导入的私人电子书内容，尚待补充注释、背景与赏析。";
  const sourceNote =
    "用户从 " + input.sourceFormat.toUpperCase() + " 文件导入；仅按所选版权状态用于私人书架。";

  return [
    "---",
    "id: " + input.slug,
    "slug: " + input.slug,
    "title: " + yamlString(input.title),
    "aliases: []",
    "authorId: " + authorId,
    "category: " + yamlString(input.category),
    "language: zh-CN",
    "estimatedMinutes: " + String(estimatedMinutes),
    "rightsStatus: " + input.rightsStatus,
    "summary: " + yamlString(summary),
    "tags: [私人导入]",
    "moods: [夜读]",
    "ambience: [rain]",
    "defaultAmbience: rain",
    "sourceNote: " + yamlString(sourceNote),
    "editorialNotes: [电子书自动导入，需人工复核排版与版权]",
    "pronunciationOverrides: []",
    "---",
    "",
    "## 原文",
    "",
    paragraphs.join("\n\n"),
    "",
    "## 创作背景",
    "",
    "私人导入内容，创作背景暂未整理。",
    "",
    "## 赏析",
    "",
    "私人导入内容，赏析暂未整理。",
    "",
  ].join("\n");
}

export async function importEbookToLibrary(rawInput: unknown) {
  const input = importRequestSchema.parse(rawInput);
  const paragraphs = safeParagraphs(input.text);
  if (!paragraphs.length) throw new Error("电子书没有可导入段落。");
  if (paragraphs.length > 5_000) throw new Error("电子书段落过多，请先按章节拆分。");

  const contentRoot = path.join(process.cwd(), "content");
  const worksDir = path.join(contentRoot, "works");
  const authorsDir = path.join(contentRoot, "authors");
  const author = authorRecord(input.author);
  const authorPath = path.join(authorsDir, author.slug + ".json");
  const workPath = path.join(worksDir, input.slug + ".md");
  const markdown = buildMarkdown(input, author.id, paragraphs);

  await mkdir(authorsDir, { recursive: true });
  await mkdir(worksDir, { recursive: true });

  try {
    await readFile(workPath, "utf8");
    throw new Error("该书架标识已存在，请换一个英文标识。");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  let parsedAuthor;
  try {
    parsedAuthor = parseAuthorJson(await readFile(authorPath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await writeFile(authorPath, JSON.stringify(author, null, 2) + "\n", {
      encoding: "utf8",
      flag: "wx",
    });
    parsedAuthor = parseAuthorJson(JSON.stringify(author));
  }

  const { work } = parseWorkMarkdown(markdown, {
    sourcePath: workPath,
    mode: "private",
  });
  work.author = parsedAuthor;

  await writeFile(workPath, markdown, { encoding: "utf8", flag: "wx" });
  try {
    await seedWork(work);
  } catch (error) {
    await rm(workPath, { force: true });
    throw error;
  }

  return {
    slug: work.slug,
    title: work.title,
    segments: work.segments.length,
    estimatedMinutes: work.estimatedMinutes,
  };
}
