import type { Metadata } from "next";
import Link from "next/link";
import { WorkCard } from "@/components/library/work-card";
import { getAllWorks } from "@/lib/content/repository";
import { listFavorites } from "@/lib/library/personal-data";

export const metadata: Metadata = {
  title: "私人收藏",
  description: "安静收好的作品。",
};

export default async function FavoritesPage() {
  const [favorites, works] = await Promise.all([listFavorites(), getAllWorks()]);
  const byId = new Map(works.map((work) => [work.id, work]));
  const favoriteWorks = favorites
    .map((favorite) => byId.get(favorite.workId))
    .filter((work): work is NonNullable<typeof work> => Boolean(work));

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
        <p className="mt-5 text-xs tracking-[0.22em] text-[var(--muted)]">私人收藏</p>
        <h1 className="font-serif mt-3 text-4xl leading-tight sm:text-5xl">想再听一遍的</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          这里只放你亲手收藏的作品，不掺推荐。
        </p>
      </header>

      <section aria-labelledby="favorites-list-title" className="mt-10 pb-16 sm:mt-12">
        <h2 className="font-serif text-2xl" id="favorites-list-title">
          {favoriteWorks.length ? "共 " + favoriteWorks.length + " 篇" : "还没有收藏"}
        </h2>

        {favoriteWorks.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {favoriteWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-current/25 px-5 py-14 text-center">
            <p className="text-sm leading-7 text-[var(--muted)]">
              在作品页点「收藏」，就会安静地出现在这里。
            </p>
            <Link
              className="mt-6 inline-flex min-h-11 items-center rounded-full border border-current/25 px-5 py-2.5 text-sm font-medium"
              href="/library"
            >
              去书架看看
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
