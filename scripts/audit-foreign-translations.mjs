import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const worksDir = path.join(process.cwd(), "content", "works");
const section = (markdown, heading, nextHeading) => {
  const start = markdown.indexOf(`## ${heading}\n`);
  const end = markdown.indexOf(`\n## ${nextHeading}`, start + 4);
  return start < 0 || end < 0 ? "" : markdown.slice(start + heading.length + 4, end).trim();
};
const paragraphs = (text) => text.split(/\n\s*\n/u).filter((item) => item.trim());

const results = [];
for (const file of await readdir(worksDir)) {
  if (!file.endsWith(".md")) continue;
  const markdown = await readFile(path.join(worksDir, file), "utf8");
  if (!/^category:\s*外国文学$/mu.test(markdown)) continue;
  const original = section(markdown, "原文", "白话");
  const translation = section(markdown, "白话", "创作背景");
  const issues = [];
  if (!/[.!?][”’"')\]]?$/u.test(original)) issues.push("原文句末截断");
  if (!/[。！？…][”’」』)]?$/u.test(translation)) issues.push("译文句末截断");
  if (paragraphs(original).length !== paragraphs(translation).length) issues.push("段落未对齐");
  if (/[*_]{1,2}[^\n]+[*_]{1,2}/u.test(translation)) issues.push("Markdown 残留");
  if (/\[P\d+\]/u.test(translation)) issues.push("审校编号残留");
  if (/\[(?:插图|Illustration)[:：\]]/iu.test(`${original}\n${translation}`)) issues.push("插图占位残留");
  const proseWithoutExplainedTerms = translation.replace(/（[^）]*[A-Za-z][^）]*）/gu, "");
  const latin = proseWithoutExplainedTerms.match(/\b[A-Za-z]{4,}\b/gu) ?? [];
  if (latin.length) issues.push(`英文残留 ${latin.slice(0, 3).join("/")}`);
  if ((translation.match(/“/gu)?.length ?? 0) !== (translation.match(/”/gu)?.length ?? 0)) issues.push("双引号不配对");
  results.push({ slug: file.slice(0, -3), issues });
}

const failed = results.filter((item) => item.issues.length);
console.log(`翻译静态审计：${results.length - failed.length}/${results.length} 篇通过，${failed.length} 篇需审校。`);
for (const item of failed) console.log(`- ${item.slug}: ${item.issues.join("；")}`);
if (process.argv.includes("--strict") && failed.length) process.exitCode = 1;
