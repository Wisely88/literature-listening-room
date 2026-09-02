import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const worksDir = path.join(root, "content", "works");
const ollamaUrl = "http://127.0.0.1:11434/api/generate";
const reviewModel = process.env.TRANSLATION_REVIEW_MODEL ?? "qwen3:14b";
const glossary = JSON.parse(
  await readFile(path.join(root, "content", "translation-glossary.json"), "utf8"),
);
const requested = process.argv.find((arg) => arg.startsWith("--ids="))?.slice(6).split(",").filter(Boolean) ?? [];
if (!requested.length) throw new Error("请用 --ids=作品slug,作品slug 指定小批量审校，避免批量覆盖。 ");

const section = (markdown, heading, nextHeading) => {
  const start = markdown.indexOf(`## ${heading}\n`);
  const end = markdown.indexOf(`\n## ${nextHeading}`, start + 4);
  if (start < 0 || end < 0) throw new Error(`缺少章节：${heading}/${nextHeading}`);
  return markdown.slice(start + heading.length + 4, end).trim();
};

const paragraphs = (text) => text.split(/\n\s*\n/u).map((item) => item.trim()).filter(Boolean);
const removeSourceArtifacts = (source) => source
  .replace(/^\s*(?:\*\s*){3,}$/gmu, "")
  .replace(/^\s*\[Illustration:[^\]]+\]\s*$/gimu, "")
  .replace(/\n{3,}/gu, "\n\n")
  .trim();
const cleanDraftParagraphs = (source) => paragraphs(source)
  .map((item) => item.replace(/^\[P\d+\]\s*/u, "").trim())
  .filter((item) => item && !/^\[?(?:插图|Illustration)[:：]/iu.test(item));
const glossaryFor = (original) => glossary
  .filter((item) => original.toLowerCase().includes(String(item.source).toLowerCase()))
  .map((item) => `${item.source} → ${item.target}（${item.note}）`)
  .join("\n");

const makeExcerptComplete = (source) => {
  const cleaned = removeSourceArtifacts(source.replace(/_([^_\n]+)_/gu, "$1"));
  if (/[.!?][”’"')\]]?$/u.test(cleaned)) return cleaned;
  const matches = [...cleaned.matchAll(/[.!?][”’"')\]]?(?=\s|$)/gu)];
  const last = matches.at(-1);
  if (!last?.index || last.index < 1800) throw new Error("无法在长文门禁以上找到完整句末。");
  return cleaned.slice(0, last.index + last[0].length).trim();
};

const generate = async (prompt) => {
  const response = await fetch(ollamaUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: reviewModel,
      stream: false,
      think: false,
      prompt,
      options: { temperature: 0.05, num_ctx: 16384, num_predict: 4200 },
    }),
  });
  if (!response.ok) throw new Error(`Ollama 审校失败：${response.status}`);
  const body = await response.json();
  return String(body.response ?? "").replace(/<think>[\s\S]*?<\/think>/gu, "").trim();
};

const normalizeRevision = (source) => source
  .replace(/\*\*([^*\n]+)\*\*/gu, "$1")
  .replace(/_([^_\n]+)_/gu, "$1")
  .replace(/[*_]/gu, "")
  .trim();

const validateRevision = (original, revision, minimumLength = 500, requireCompleteEnding = true) => {
  const issues = [];
  if (paragraphs(original).length !== paragraphs(revision).length) issues.push("段落数量不一致");
  if (revision.replace(/\s/gu, "").length < minimumLength) issues.push("译文过短");
  if (/[*_]{1,2}[^\n]+[*_]{1,2}/u.test(revision)) issues.push("含 Markdown 排版残留");
  if (requireCompleteEnding && !/[。！？…][”’」』)]?$/u.test(revision)) issues.push("译文结尾不是完整句子");
  if ((revision.match(/“/gu)?.length ?? 0) !== (revision.match(/”/gu)?.length ?? 0)) issues.push("中文双引号不配对");
  return issues;
};

const numbered = (items) => items.map((item, index) => `[P${index + 1}] ${item}`).join("\n\n");
const parseNumbered = (source, expected) => {
  const matches = [...source.matchAll(/\[P(\d+)\]\s*([\s\S]*?)(?=\n\s*\[P\d+\]|$)/gu)];
  if (matches.length !== expected) return /\[P\d+\]/u.test(source) ? [] : paragraphs(source);
  return matches
    .sort((left, right) => Number(left[1]) - Number(right[1]))
    .map((match) => match[2].trim());
};

const stamp = new Date().toISOString().replace(/[:.]/gu, "-");
const backupDir = path.join(root, "storage", "translation-backups", stamp);
await mkdir(backupDir, { recursive: true });

for (const id of requested) {
  const target = path.join(worksDir, `${id}.md`);
  const markdown = await readFile(target, "utf8");
  if (!/^category:\s*外国文学$/mu.test(markdown)) throw new Error(`${id} 不是外国文学作品。`);
  const title = markdown.match(/^title:\s*(.+)$/mu)?.[1]?.trim() ?? id;
  const original = makeExcerptComplete(section(markdown, "原文", "白话"));
  const draft = section(markdown, "白话", "创作背景");
  const originalParagraphs = paragraphs(original);
  let draftParagraphs = cleanDraftParagraphs(draft);
  const count = originalParagraphs.length;
  if (draftParagraphs.length === count + 1) {
    console.log(`  [去除截断尾段] 旧译 ${draftParagraphs.length} 段 → ${count} 段`);
    draftParagraphs = draftParagraphs.slice(0, count);
  } else if (draftParagraphs.length !== count) {
    throw new Error(`${title} 现有原译段落不一致，请先运行段落对齐脚本。`);
  }
  console.log(`[审校] ${title}，${count} 段，模型 ${reviewModel}`);
  const revisedParagraphs = [];
  const chunkSize = 8;
  for (let offset = 0; offset < count; offset += chunkSize) {
    const originalItems = originalParagraphs.slice(offset, offset + chunkSize);
    const draftItems = draftParagraphs.slice(offset, offset + chunkSize);
    const originalChunk = originalItems.join("\n\n");
    const chunkCount = originalItems.length;
    const terms = glossaryFor(originalChunk);
    console.log(`  [分段 ${offset + 1}-${Math.min(offset + chunkSize, count)}/${count}]`);
    const revisedChunk = normalizeRevision(await generate(`/no_think
你是资深中英文学译审和有声书中文编辑。请逐句对照英文原文，对现有译文作实质审校并输出定稿。
必须修正错译、漏译、直译腔、英文残留、人名断裂、Markdown 符号、标点和引号错误。忠实优先于华丽，不删节、不概述、不补写；专名使用稳定中文译名；普通词语译成中文；冷僻饮食等首次可写“中文译名（原文）”。本批必须保持 ${chunkCount} 个一一对应段落，语句适合自然中文朗读。每段必须以对应的 [P1] 至 [P${chunkCount}] 开头，不得合并、拆分或遗漏编号。只输出带编号的定稿译文，不要标题、说明或评分。
${terms ? `\n【强制术语表】\n${terms}\n` : ""}

【英文原文】
${numbered(originalItems)}

【现有译文】
${numbered(draftItems)}`));
    const parsedChunk = parseNumbered(revisedChunk, chunkCount).join("\n\n");
    const minimumLength = Math.max(40, Math.floor(originalChunk.replace(/\s/gu, "").length * 0.18));
    const chunkIssues = validateRevision(originalChunk, parsedChunk, minimumLength, false);
    if (chunkIssues.length) {
      throw new Error(`${title} 第 ${offset + 1}-${offset + chunkCount} 段未过门禁：${chunkIssues.join("、")}`);
    }
    revisedParagraphs.push(...paragraphs(parsedChunk));
  }
  const revision = revisedParagraphs.join("\n\n");
  const issues = validateRevision(original, revision);
  if (issues.length) throw new Error(`${title} 审校结果未过门禁：${issues.join("、")}`);
  await writeFile(path.join(backupDir, `${id}.md`), markdown, "utf8");
  const next = markdown
    .replace(/## 原文\n[\s\S]*?\n## 白话\n/u, `## 原文\n${original}\n\n## 白话\n`)
    .replace(/## 白话\n[\s\S]*?\n## 创作背景\n/u, `## 白话\n${revision}\n\n## 创作背景\n`);
  await writeFile(target, next, "utf8");
  console.log(`[完成] ${title}，备份已保存`);
}
