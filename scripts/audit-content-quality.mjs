import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const worksDir = path.join(process.cwd(), "content", "works");
const section = (markdown, heading, nextHeading) => {
  const start = markdown.indexOf(`## ${heading}\n`);
  const end = markdown.indexOf(`\n## ${nextHeading}`, start + 4);
  return start < 0 || end < 0 ? "" : markdown.slice(start + heading.length + 4, end).trim();
};
const paragraphs = (value) => value.split(/\n\s*\n/u).map((item) => item.trim()).filter(Boolean);
const genericPhrases = [
  "这段文字以凝练的叙述、意象或议论展开核心主题",
  "作品从一个清晰的场景、问题或人物关系进入主题",
  "短短的开篇或关键场景迅速建立人物、环境和叙事语气",
];

const reports = [];
const shortCompleteCandidates = [];
for (const file of (await readdir(worksDir)).filter((item) => item.endsWith(".md"))) {
  const markdown = await readFile(path.join(worksDir, file), "utf8");
  const language = markdown.match(/^language: ([^\n]+)/m)?.[1]?.trim() ?? "zh-CN";
  const category = markdown.match(/^category: ([^\n]+)/m)?.[1]?.trim() ?? "";
  const original = section(markdown, "原文", "白话");
  const translation = section(markdown, "白话", "创作背景");
  const chars = original.replace(/\s/gu, "").length;
  const issues = [];
  if (chars < 80) {
    if (category === "诗词") shortCompleteCandidates.push({ slug: file.slice(0, -3), chars });
    else issues.push("短篇节选");
  }
  if (genericPhrases.some((phrase) => markdown.includes(phrase))) issues.push("模板导语");
  if (!translation) issues.push("缺少译文");
  if (translation && paragraphs(original).length !== paragraphs(translation).length) issues.push("译文未逐段对齐");
  if (language === "zh-CN") {
    try {
      const annotations = JSON.parse(await readFile(path.join(worksDir, file.replace(/\.md$/u, ".annotations.json")), "utf8"));
      if (!Array.isArray(annotations) || annotations.length === 0) issues.push("注释为空");
    } catch {
      issues.push("无注释文件");
    }
  }
  if (issues.length) reports.push({ slug: file.slice(0, -3), chars, issues });
}

const counts = new Map();
for (const report of reports) for (const issue of report.issues) counts.set(issue, (counts.get(issue) ?? 0) + 1);
console.log(`内容质量审计：${reports.length} 篇需要编辑复核。`);
console.log(`- 短篇完整候选（诗词）：${shortCompleteCandidates.length}`);
for (const [issue, count] of counts) console.log(`- ${issue}: ${count}`);
for (const report of reports) console.log(`- ${report.slug} [${report.chars}字]：${report.issues.join("、")}`);
if (process.argv.includes("--strict") && reports.length) process.exitCode = 1;
