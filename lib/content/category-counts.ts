import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** Read only front-matter categories so the home page can remain synchronous. */
export function getCategoryCountsSync(categories: readonly string[]): Record<string, number> {
  const counts = Object.fromEntries(categories.map((category) => [category, 0]));
  const worksDir = path.join(process.cwd(), "content", "works");
  let files: string[];
  try {
    files = readdirSync(worksDir).filter((file) => file.endsWith(".md"));
  } catch {
    return counts;
  }
  for (const file of files) {
    const match = readFileSync(path.join(worksDir, file), "utf8").match(/^category:\s*(.+)$/mu);
    const category = match?.[1]?.trim();
    if (category && category in counts) counts[category] += 1;
  }
  return counts;
}
