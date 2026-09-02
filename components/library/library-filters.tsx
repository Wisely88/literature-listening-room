import Link from "next/link";
import {
  FOREIGN_LITERATURE_CATEGORY,
  FOREIGN_LITERATURE_GENRES,
} from "@/lib/content/foreign-literature";
import {
  buildLibraryHref,
  DURATION_OPTIONS,
  LIBRARY_CATEGORIES,
  LIBRARY_MOODS,
  SORT_OPTIONS,
  type LibrarySearchParams,
} from "./library-options";

export type AuthorOption = {
  slug: string;
  name: string;
};

type LibraryFiltersProps = {
  current: LibrarySearchParams;
  authors: AuthorOption[];
  categoryCounts: Readonly<Record<string, number>>;
  foreignGenreCounts: Readonly<Record<string, number>>;
  totalCount: number;
};

const fieldClassName =
  "min-h-11 w-full rounded-xl border border-current/20 bg-transparent px-3 py-2.5 text-sm text-[var(--ink)] focus:border-current";

export function LibraryFilters({
  current,
  authors,
  categoryCounts,
  foreignGenreCounts,
  totalCount,
}: LibraryFiltersProps) {
  return (
    <section aria-labelledby="library-filter-title" className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-[var(--muted)]">找一篇适合今晚的文章</p>
          <h2 id="library-filter-title" className="font-serif mt-2 text-2xl">
            搜索与筛选
          </h2>
        </div>
        <p className="text-sm text-[var(--muted)]">共 {totalCount} 篇已完整收录</p>
      </div>

      <form
        action="/library"
        className="mt-5 grid gap-4 rounded-2xl border border-current/15 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-6"
        method="get"
      >
        {current.genre ? <input name="genre" type="hidden" value={current.genre} /> : null}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="mb-2 block text-sm font-medium" htmlFor="library-q">
            关键词
          </label>
          <input
            className={fieldClassName}
            defaultValue={current.q}
            id="library-q"
            name="q"
            placeholder="标题、作者、别名、标签……"
            type="search"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="library-category">
            分类
          </label>
          <select
            className={fieldClassName}
            defaultValue={current.category ?? ""}
            id="library-category"
            name="category"
          >
            <option value="">全部分类</option>
            {LIBRARY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="library-author">
            作者
          </label>
          <select
            className={fieldClassName}
            defaultValue={current.author ?? ""}
            id="library-author"
            name="author"
          >
            <option value="">全部作者</option>
            {authors.map((author) => (
              <option key={author.slug} value={author.slug}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="library-duration">
            时长
          </label>
          <select
            className={fieldClassName}
            defaultValue={current.duration ?? ""}
            id="library-duration"
            name="duration"
          >
            <option value="">不限时长</option>
            {DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="library-mood">
            心情
          </label>
          <select
            className={fieldClassName}
            defaultValue={current.mood ?? ""}
            id="library-mood"
            name="mood"
          >
            <option value="">不限心情</option>
            {LIBRARY_MOODS.map((mood) => (
              <option key={mood} value={mood}>
                {mood}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <label className="mb-2 block text-sm font-medium" htmlFor="library-sort">
            排序
          </label>
          <select
            className={fieldClassName}
            defaultValue={current.sort}
            id="library-sort"
            name="sort"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            <option disabled value="favorite">
              私人收藏（收藏阶段开放）
            </option>
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-4">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--paper)] transition-opacity hover:opacity-85"
            type="submit"
          >
            筛选书架
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-current/20 px-5 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
            href="/library"
          >
            清除条件
          </Link>
        </div>
      </form>

      <nav aria-label="作品分类" className="mt-7">
        <p className="mb-3 text-sm font-medium">按分类浏览</p>
        <div className="flex flex-wrap gap-2">
          <Link
            aria-current={!current.category ? "page" : undefined}
            className={`library-category-pill inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm ${
              !current.category
                ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                : "border-current/20 text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            href={buildLibraryHref(current, { category: undefined, genre: undefined })}
          >
            全部 <span className="ml-1.5 opacity-70">{totalCount}</span>
          </Link>
          {LIBRARY_CATEGORIES.map((category) => {
            const active = current.category === category;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`library-category-pill inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm ${
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                    : "border-current/20 text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
                href={buildLibraryHref(current, {
                  category,
                  genre: category === FOREIGN_LITERATURE_CATEGORY ? current.genre : undefined,
                })}
                key={category}
              >
                {category} <span className="ml-1.5 opacity-70">{categoryCounts[category] ?? 0}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {current.category === FOREIGN_LITERATURE_CATEGORY ? (
        <nav aria-label="外国文学题材分类" className="mt-5 border-l-2 border-[var(--accent)] pl-4">
          <p className="mb-3 text-sm font-medium">按题材浏览外国文学</p>
          <div className="flex flex-wrap gap-2">
            <Link
              aria-current={!current.genre ? "page" : undefined}
              className={`library-category-pill inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm ${
                !current.genre
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                  : "border-current/20 text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
              href={buildLibraryHref(current, { genre: undefined })}
            >
              全部外国文学
              <span className="ml-1.5 opacity-70">
                {categoryCounts[FOREIGN_LITERATURE_CATEGORY] ?? 0}
              </span>
            </Link>
            {FOREIGN_LITERATURE_GENRES.map((genre) => {
              const active = current.genre === genre;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`library-category-pill inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]"
                      : "border-current/20 text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                  href={buildLibraryHref(current, { genre })}
                  key={genre}
                >
                  {genre}
                  <span className="ml-1.5 opacity-70">{foreignGenreCounts[genre] ?? 0}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
