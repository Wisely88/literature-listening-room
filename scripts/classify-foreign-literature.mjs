import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const worksDir = path.join(process.cwd(), "content", "works");

const groups = {
  "经典小说": [
    "pride-and-prejudice-opening",
    "jane-eyre-red-room",
    "great-expectations-marshes",
    "gift-of-the-magi",
    "the-last-leaf",
    "the-necklace",
    "death-of-ivan-ilyich",
  ],
  "散文随笔": [
    "walden-sounds",
    "walden-solitude-2",
    "walden-visitors",
    "walden-village",
    "walden-ponds",
    "walden-baker-farm",
    "walden-brute-neighbors",
    "walden-winter-animals",
    "walden-spring",
  ],
  "奇幻文学": [
    "christmas-carol-marley",
    "alice-down-rabbit-hole",
    "happy-prince-statue",
    "little-match-girl",
  ],
  "科幻文学": ["frankenstein-creation-night"],
  "推理探案": ["crime-and-punishment-room"],
  "恐怖惊悚": ["wuthering-heights-arrival", "legend-of-sleepy-hollow"],
  "传记 / 自传": ["walden-solitude", "walden-where-lived", "walden-bean-field"],
  "思想随笔": ["walden-economy", "walden-reading", "walden-higher-laws"],
};

let changed = 0;
for (const [genre, ids] of Object.entries(groups)) {
  for (const id of ids) {
    const target = path.join(worksDir, `${id}.md`);
    const source = await readFile(target, "utf8");
    const next = /^foreignGenre:/mu.test(source)
      ? source.replace(/^foreignGenre:.*$/mu, `foreignGenre: ${genre}`)
      : source.replace(/^category: 外国文学$/mu, `category: 外国文学\nforeignGenre: ${genre}`);
    if (next !== source) {
      await writeFile(target, next, "utf8");
      changed += 1;
    }
  }
}

console.log(`外国文学题材标注完成：更新 ${changed} 篇。`);
