import type { Metadata } from "next";
import Link from "next/link";
import { LibraryEmptyState } from "@/components/library/library-empty-state";
import { LibraryFilters } from "@/components/library/library-filters";
import {
  hasActiveLibraryFilters,
  LIBRARY_CATEGORIES,
  parseLibrarySearchParams,
  toWorkQuery,
} from "@/components/library/library-options";
import { WorkCard } from "@/components/library/work-card";
import { getAllWorks } from "@/lib/content/repository";
import {
  FOREIGN_LITERATURE_CATEGORY,
  FOREIGN_LITERATURE_GENRES,
} from "@/lib/content/foreign-literature";

export const metadata: Metadata = {
  title: "分类书架",
  description: "按作者、分类、心情与朗读时长，找一篇适合今晚的文章。",
};

export default async function LibraryPage() {
  const current = parseLibrarySearchParams({});
  const [allWorks, works] = await Promise.all([
    getAllWorks(),
    getAllWorks(toWorkQuery(current)),
  ]);

  const authorMap = new Map<string, string>();
  const categoryCounts: Record<string, number> = Object.fromEntries(
    LIBRARY_CATEGORIES.map((category) => [category, 0]),
  );
  const foreignGenreCounts: Record<string, number> = Object.fromEntries(
    FOREIGN_LITERATURE_GENRES.map((genre) => [genre, 0]),
  );

  for (const work of allWorks) {
    categoryCounts[work.category] = (categoryCounts[work.category] ?? 0) + 1;
    if (work.category === FOREIGN_LITERATURE_CATEGORY) {
      if (work.foreignGenre) {
        foreignGenreCounts[work.foreignGenre] = (foreignGenreCounts[work.foreignGenre] ?? 0) + 1;
      }
    }
    if (work.author) authorMap.set(work.author.slug, work.author.name);
  }

  const authors = [...authorMap.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
  const filtered = hasActiveLibraryFilters(current);
  const hasNarrowingFilter = Boolean(
    current.q || current.genre || current.author || current.duration || current.mood,
  );
  const resultLabel = current.genre
    ? `${current.category} · ${current.genre}`
    : current.category
      ? `${current.category}书架`
      : "全部作品";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl overflow-x-hidden px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-current/15 pb-7 sm:pb-9">
        <nav aria-label="面包屑">
          <Link
            className="inline-flex min-h-11 items-center text-sm text-[var(--muted)] underline-offset-4 hover:underline"
            href="/"
          >
            ← 回到听读馆
          </Link>
        </nav>
        <p className="mt-5 text-xs tracking-[0.22em] text-[var(--muted)]">私人文学听读馆</p>
        <h1 className="font-serif mt-3 text-4xl leading-tight sm:text-5xl">分类书架</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          按文章、作者、分类、时长或心情安静地找。外国文学还可按历史、奇幻、科幻、探案、传记等题材继续细分。
        </p>
      </header>

      <LibraryFilters
        authors={authors}
        categoryCounts={categoryCounts}
        foreignGenreCounts={foreignGenreCounts}
        current={current}
        totalCount={allWorks.length}
      />

      <section aria-labelledby="library-results-title" className="mt-10 pb-16 sm:mt-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm text-[var(--muted)]">{resultLabel}</p>
            <h2 id="library-results-title" className="font-serif mt-1 text-2xl">
              {works.length ? `找到 ${works.length} 篇` : "暂无结果"}
            </h2>
          </div>
          {filtered ? <p className="text-xs text-[var(--muted)]">已按当前条件筛选</p> : null}
        </div>

        {works.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <LibraryEmptyState
            kind={current.category && !hasNarrowingFilter ? "category" : "filters"}
          />
        )}
      </section>
    </main>
  );
}
