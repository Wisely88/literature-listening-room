import Link from "next/link";

type LibraryEmptyStateProps = {
  kind: "category" | "filters";
};

export function LibraryEmptyState({ kind }: LibraryEmptyStateProps) {
  const isCategoryShelf = kind === "category";

  return (
    <section
      aria-labelledby="empty-library-title"
      className="rounded-2xl border border-dashed border-current/25 px-5 py-12 text-center sm:px-8 sm:py-16"
    >
      <p aria-hidden="true" className="font-serif text-3xl text-[var(--muted)]">
        《》
      </p>
      <h2 id="empty-library-title" className="font-serif mt-4 text-2xl">
        {isCategoryShelf ? "这层书架还在等第一篇作品" : "没有找到符合条件的作品"}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">
        {isCategoryShelf
          ? "V1 先把《记承天寺夜游》做成完整样本，不用未完成的内容填满页面。"
          : "试试减少一项筛选，或清除关键词后再看看。"}
      </p>
      <Link
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-current/25 px-5 py-2.5 text-sm font-medium"
        href="/library"
      >
        回到全部书架
      </Link>
    </section>
  );
}
