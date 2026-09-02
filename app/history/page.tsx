import type { Metadata } from "next";
import Link from "next/link";
import { getAllWorks } from "@/lib/content/repository";
import { listRecentProgress } from "@/lib/library/personal-data";
import type { Work } from "@/lib/content/types";

export const metadata: Metadata = {
  title: "最近播放",
  description: "接着上次的进度，继续听完一篇好文章。",
};

type HistoryItem = {
  work: Work;
  completed: boolean;
  segmentIndex: number | null;
  lastOpenedAt: Date;
};

function segmentIndexLabel(work: Work, segmentId: string | null): number | null {
  if (!segmentId) return null;
  const index = work.segments.findIndex((segment) => segment.id === segmentId);
  return index >= 0 ? index + 1 : null;
}

export default async function HistoryPage() {
  const [progressRows, works] = await Promise.all([listRecentProgress(), getAllWorks()]);
  const byId = new Map(works.map((work) => [work.id, work]));
  const history: HistoryItem[] = progressRows
    .map((row) => {
      const work = byId.get(row.workId);
      if (!work) return null;
      return {
        work,
        completed: row.completed,
        segmentIndex: segmentIndexLabel(work, row.segmentId),
        lastOpenedAt: row.lastOpenedAt,
      };
    })
    .filter((item): item is HistoryItem => item !== null);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl overflow-x-hidden px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-current/15 pb-7 sm:pb-9">
        <nav aria-label="面包屑">
          <Link
            className="inline-flex min-h-11 items-center text-sm text-[var(--muted)] underline-offset-4 hover:underline"
            href="/"
          >
            ← 回到听读馆
          </Link>
        </nav>
        <p className="mt-5 text-xs tracking-[0.22em] text-[var(--muted)]">最近播放</p>
        <h1 className="font-serif mt-3 text-4xl leading-tight sm:text-5xl">从上次停下的地方继续</h1>
      </header>

      <section aria-labelledby="history-list-title" className="mt-10 pb-16 sm:mt-12">
        <h2 className="font-serif text-2xl" id="history-list-title">
          {history.length ? "播放记录" : "还没有播放记录"}
        </h2>

        {history.length ? (
          <ol className="mt-6 divide-y divide-current/15 border-y border-current/15">
            {history.map((item) => {
              const authorName = item.work.author?.name ?? "佚名";
              return (
                <li key={item.work.id}>
                  <Link
                    className="grid min-h-11 gap-2 py-5 transition-colors hover:bg-current/5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-3"
                    href={"/work/" + item.work.slug}
                  >
                    <span className="min-w-0">
                      <span className="font-serif block text-xl leading-snug">
                        《{item.work.title}》
                      </span>
                      <span className="mt-1 block text-sm text-[var(--muted)]">
                        {authorName}
                        {item.work.dynasty ? " · " + item.work.dynasty : ""}
                      </span>
                    </span>
                    <span className="text-sm text-[var(--muted)]">
                      {item.completed
                        ? "已听完"
                        : item.segmentIndex
                          ? "听到第 " + item.segmentIndex + " 段"
                          : "刚开始"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
            开始听一篇后，进度会安静地留在这里。
          </p>
        )}
      </section>
    </main>
  );
}
