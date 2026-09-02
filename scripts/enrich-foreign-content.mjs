import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const worksDir = path.join(root, "content", "works");
const ollamaUrl = "http://127.0.0.1:11434/api/generate";
const glossary = JSON.parse(
  await readFile(path.join(root, "content", "translation-glossary.json"), "utf8"),
);
const glossaryFor = (original) => glossary
  .filter((item) => original.toLowerCase().includes(String(item.source).toLowerCase()))
  .map((item) => `${item.source} → ${item.target}（${item.note}）`)
  .join("\n");

const waldenUrl = "https://www.gutenberg.org/cache/epub/205/pg205.txt";
const sources = {
  "the-time-machine": "https://www.gutenberg.org/cache/epub/35/pg35.txt",
  "the-war-of-the-worlds": "https://www.gutenberg.org/cache/epub/36/pg36.txt",
  "twenty-thousand-leagues": "https://www.gutenberg.org/cache/epub/164/pg164.txt",
  "the-invisible-man": "https://www.gutenberg.org/cache/epub/5230/pg5230.txt",
  "a-scandal-in-bohemia": "https://www.gutenberg.org/cache/epub/1661/pg1661.txt",
  "murders-in-rue-morgue": "https://www.gutenberg.org/cache/epub/2147/pg2147.txt",
  "the-moonstone": "https://www.gutenberg.org/cache/epub/155/pg155.txt",
  "the-woman-in-white": "https://www.gutenberg.org/cache/epub/583/pg583.txt",
  "war-and-peace": "https://www.gutenberg.org/cache/epub/2600/pg2600.txt",
  "les-miserables": "https://www.gutenberg.org/cache/epub/135/pg135.txt",
  "last-of-the-mohicans": "https://www.gutenberg.org/cache/epub/940/pg940.txt",
  "ivanhoe": "https://www.gutenberg.org/cache/epub/82/pg82.txt",
  "autobiography-benjamin-franklin": "https://www.gutenberg.org/cache/epub/20203/pg20203.txt",
  "narrative-frederick-douglass": "https://www.gutenberg.org/cache/epub/23/pg23.txt",
  "dracula": "https://www.gutenberg.org/cache/epub/345/pg345.txt",
  "jekyll-and-hyde": "https://www.gutenberg.org/cache/epub/43/pg43.txt",
  "fall-of-house-of-usher": "https://www.gutenberg.org/cache/epub/932/pg932.txt",
  "peter-pan": "https://www.gutenberg.org/cache/epub/16/pg16.txt",
  "civil-disobedience": "https://www.gutenberg.org/cache/epub/71/pg71.txt",
  "the-prophet": "https://www.gutenberg.org/cache/epub/58585/pg58585.txt",
  "a-tale-of-two-cities": "https://www.gutenberg.org/cache/epub/98/pg98.txt",
  "pride-and-prejudice-opening": "https://www.gutenberg.org/cache/epub/1342/pg1342.txt",
  "jane-eyre-red-room": "https://www.gutenberg.org/cache/epub/1260/pg1260.txt",
  "wuthering-heights-arrival": "https://www.gutenberg.org/cache/epub/768/pg768.txt",
  "great-expectations-marshes": "https://www.gutenberg.org/cache/epub/1400/pg1400.txt",
  "christmas-carol-marley": "https://www.gutenberg.org/cache/epub/46/pg46.txt",
  "frankenstein-creation-night": "https://www.gutenberg.org/cache/epub/84/pg84.txt",
  "alice-down-rabbit-hole": "https://www.gutenberg.org/cache/epub/11/pg11.txt",
  "happy-prince-statue": "https://www.gutenberg.org/cache/epub/902/pg902.txt",
  "gift-of-the-magi": "https://www.gutenberg.org/cache/epub/7256/pg7256.txt",
  "the-last-leaf": "https://www.gutenberg.org/cache/epub/3707/pg3707.txt",
  "legend-of-sleepy-hollow": "https://www.gutenberg.org/cache/epub/41/pg41.txt",
  "the-necklace": "https://www.gutenberg.org/cache/epub/3090/pg3090.txt",
  "crime-and-punishment-room": "https://www.gutenberg.org/cache/epub/2554/pg2554.txt",
  "death-of-ivan-ilyich": "https://en.wikisource.org/w/api.php?action=parse&page=The_Death_of_Ivan_Ilych%2FI&prop=text&format=json",
  "little-match-girl": "https://www.gutenberg.org/cache/epub/1597/pg1597.txt",
};

const waldenIds = [
  "walden-solitude",
  "walden-economy",
  "walden-where-lived",
  "walden-reading",
  "walden-sounds",
  "walden-solitude-2",
  "walden-visitors",
  "walden-bean-field",
  "walden-village",
  "walden-ponds",
  "walden-baker-farm",
  "walden-higher-laws",
  "walden-brute-neighbors",
  "walden-winter-animals",
  "walden-spring",
];
for (const id of waldenIds) sources[id] = waldenUrl;

const needleOverrides = {
  "the-war-of-the-worlds": "No one would have believed in the last years of the nineteenth century",
  "twenty-thousand-leagues": "The year 1866 was signalised by a remarkable incident",
  "murders-in-rue-morgue": "The mental features discoursed of as the analytical",
  "the-moonstone": "In the first part of _Robinson Crusoe_, at page one hundred and",
  "war-and-peace": "Well, Prince, so Genoa and Lucca are now just family estates",
  "les-miserables": "In 1815, M. Charles-Francois-Bienvenu Myriel was Bishop of Digne",
  "autobiography-benjamin-franklin": "Dear son: I have ever had pleasure in obtaining any little anecdotes",
  "narrative-frederick-douglass": "I was born in Tuckahoe, near Hillsborough",
  "dracula": "3 May. Bistritz",
  "fall-of-house-of-usher": "During the whole of a dull, dark, and soundless day",
  "civil-disobedience": "I heartily accept the motto",
  "great-expectations-marshes": "My father’s family name being Pirrip, and my Christian name Philip",
  "the-necklace": "The girl was one of those pretty and charming young creatures who",
  "death-of-ivan-ilyich": "During an interval in the Melvinski trial",
  "little-match-girl": "Most terribly cold it was; it snowed",
  "walden-ponds": "A lake is the landscape’s most beautiful and expressive feature",
};

const collapseText = (source) => {
  const body = source
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&rsquo;|&#8217;/g, "’")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&amp;|&#38;/g, "&")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n");
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n+/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n\n");
};

const section = (markdown, heading, nextHeading) => {
  const start = markdown.indexOf(`## ${heading}\n`);
  const end = markdown.indexOf(`\n## ${nextHeading}`, start + 4);
  if (start < 0 || end < 0) throw new Error(`缺少章节：${heading}/${nextHeading}`);
  return markdown.slice(start + heading.length + 4, end).trim();
};

const selectExcerpt = (source, needle) => {
  const normalized = collapseText(source);
  const key = needle.replace(/\s+/g, " ").trim().slice(0, 48).toLowerCase();
  let start = normalized.toLowerCase().indexOf(key);
  if (start < 0) {
    const shorter = key.slice(0, 24);
    start = normalized.toLowerCase().indexOf(shorter);
  }
  if (start < 0) return null;
  const paragraphStart = normalized.lastIndexOf("\n\n", start);
  start = paragraphStart >= 0 ? paragraphStart + 2 : start;
  const preferredEnd = Math.min(normalized.length, start + 4200);
  const paragraphEnd = normalized.indexOf("\n\n", preferredEnd);
  let end = paragraphEnd > 0 && paragraphEnd - start < 5200 ? paragraphEnd : preferredEnd;
  if (!/[.!?][”’"')\]]?$/u.test(normalized.slice(start, end).trim())) {
    const candidates = [...normalized.slice(start, Math.min(normalized.length, start + 5200)).matchAll(/[.!?][”’"')\]]?(?=\s|$)/gu)];
    const complete = candidates.filter((match) => (match.index ?? 0) >= 3600).at(-1);
    if (complete?.index !== undefined) end = start + complete.index + complete[0].length;
  }
  const excerpt = normalized.slice(start, end).trim();
  return excerpt.length >= 1800 ? excerpt : null;
};

const generate = async (prompt, model = "qwen3:8b") => {
  const response = await fetch(ollamaUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      think: false,
      prompt,
      options: { temperature: 0.05, num_ctx: 16384, num_predict: 4200 },
    }),
  });
  if (!response.ok) throw new Error(`Ollama 翻译失败：${response.status}`);
  const payload = await response.json();
  return String(payload.response ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
};

const translate = async (title, excerpt) => {
  const paragraphCount = excerpt.split(/\n\s*\n/u).filter(Boolean).length;
  const terms = glossaryFor(excerpt);
  const draft = await generate(`/no_think
你是严谨的中英文学译者。把下面《${title}》公版英文节选逐句完整翻译成自然、克制、适合中文朗读的现代汉语。
硬性要求：不删节、不概述、不增添原文没有的信息；人名、地名和术语前后一致；普通英文词必须译成中文；保留 ${paragraphCount} 个对应段落；清除下划线等排版标记；正确使用中文引号；不要添加标题、解释或注释，只输出译文。
${terms ? `\n【强制术语表】\n${terms}\n` : ""}

${excerpt}`);
  return generate(`/no_think
你是资深文学译审和有声书中文编辑。请逐句对照英文原文，审校并重写初译，修正错译、漏译、直译腔、英文残留、人名断裂、标点和引号错误。
硬性要求：忠实程度优先于华丽；不得删节或补写；专名采用稳定中文译名，冷僻饮食等首次可用“中文译名（原文）”；译文必须与原文保持 ${paragraphCount} 个一一对应段落；每段完整收束；不得输出 Markdown、说明、评分或标题，只输出定稿译文。
${terms ? `\n【强制术语表】\n${terms}\n` : ""}

【英文原文】
${excerpt}

【初译】
${draft}`, process.env.TRANSLATION_REVIEW_MODEL ?? "qwen3:14b");
};

const sourceCache = new Map();
let updated = 0;
const failures = [];

const downloadText = async (url) => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (url.includes("/w/api.php")) {
        return JSON.parse(text).parse.text["*"];
      }
      return text;
    } catch (error) {
      lastError = error;
      console.warn(`[重试 ${attempt}/3] ${url}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 800));
    }
  }
  throw lastError;
};

for (const [id, url] of Object.entries(sources)) {
  const file = path.join(worksDir, `${id}.md`);
  const markdown = await readFile(file, "utf8");
  const title = markdown.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? id;
  const currentOriginal = section(markdown, "原文", "白话");
  if (currentOriginal.length >= 1800) {
    console.log(`[跳过] ${title} 已有 ${currentOriginal.length} 字符`);
    continue;
  }

  let source = sourceCache.get(url);
  if (!source) {
    console.log(`[下载] ${url}`);
    try {
      source = await downloadText(url);
    } catch (error) {
      failures.push(`${title}: 下载失败 ${String(error)}`);
      continue;
    }
    sourceCache.set(url, source);
  }

  const excerpt = selectExcerpt(source, needleOverrides[id] ?? currentOriginal);
  if (!excerpt) {
    failures.push(`${title}: 无法定位或节选过短`);
    continue;
  }

  console.log(`[翻译 ${updated + 1}/${Object.keys(sources).length}] ${title}，原文 ${excerpt.length} 字符`);
  const translation = await translate(title, excerpt);
  if (translation.length < 500) {
    failures.push(`${title}: 译文过短 ${translation.length}`);
    continue;
  }

  const replacement = `## 原文\n${excerpt}\n\n## 白话\n${translation}\n`;
  const next = markdown.replace(/## 原文\n[\s\S]*?\n## 白话\n[\s\S]*?\n## 创作背景\n/, `${replacement}\n## 创作背景\n`);
  if (next === markdown) {
    failures.push(`${title}: Markdown 替换失败`);
    continue;
  }
  await writeFile(file, next, "utf8");
  updated += 1;
}

console.log(`外国文学长文处理完成：更新 ${updated} 篇，失败 ${failures.length} 篇。`);
for (const failure of failures) console.error(`- ${failure}`);
if (failures.length) process.exitCode = 1;
