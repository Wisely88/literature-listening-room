import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const worksDir = path.join(process.cwd(), "content", "works");

const section = (markdown, heading, nextHeading) => {
  const start = markdown.indexOf(`## ${heading}\n`);
  const end = markdown.indexOf(`\n## ${nextHeading}`, start + 4);
  if (start < 0 || end < 0) throw new Error(`缺少章节：${heading}/${nextHeading}`);
  return markdown.slice(start + heading.length + 4, end).trim();
};

const paragraphs = (text) => text.split(/\n\s*\n/u).map((value) => value.trim()).filter(Boolean);

const splitLongest = (items) => {
  const index = items.reduce(
    (best, item, current) => (item.length > items[best].length ? current : best),
    0,
  );
  const source = items[index];
  const sentences = source.match(/[^。！？!?]+[。！？!?]?/gu)?.filter((value) => value.trim()) ?? [];
  if (sentences.length < 2) {
    const middle = Math.floor(source.length / 2);
    return [...items.slice(0, index), source.slice(0, middle), source.slice(middle), ...items.slice(index + 1)];
  }
  const middle = Math.ceil(sentences.length / 2);
  return [
    ...items.slice(0, index),
    sentences.slice(0, middle).join("").trim(),
    sentences.slice(middle).join("").trim(),
    ...items.slice(index + 1),
  ];
};

let changed = 0;
for (const file of await readdir(worksDir)) {
  if (!file.endsWith(".md")) continue;
  const target = path.join(worksDir, file);
  const markdown = await readFile(target, "utf8");
  if (!/^category:\s*外国文学$/mu.test(markdown)) continue;

  const originals = paragraphs(section(markdown, "原文", "白话"));
  let translations = paragraphs(section(markdown, "白话", "创作背景"));
  const before = translations.length;

  while (translations.length > originals.length) {
    const mergeAt = translations.length - 2;
    translations.splice(mergeAt, 2, `${translations[mergeAt]} ${translations[mergeAt + 1]}`.trim());
  }
  while (translations.length < originals.length) translations = splitLongest(translations);
  if (translations.length === before) continue;

  const next = markdown.replace(
    /## 白话\n[\s\S]*?\n## 创作背景\n/u,
    `## 白话\n${translations.join("\n\n")}\n\n## 创作背景\n`,
  );
  await writeFile(target, next, "utf8");
  changed += 1;
  console.log(`${file}: 原文 ${originals.length} 段，译文 ${before} → ${translations.length} 段`);
}

console.log(`外国文学段落对齐完成：调整 ${changed} 篇。`);
