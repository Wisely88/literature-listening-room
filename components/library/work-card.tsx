import type { Work } from "@/lib/content/types";

export function WorkCard({ work }: { work: Work }) {
  const authorName = work.author?.name ?? "佚名";

  return (
    <article className="flex h-full min-w-0 flex-col rounded-2xl border border-current/15 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--muted)]">
        <span>{work.category}</span>
        {work.category === "外国文学" && work.foreignGenre ? <span>{work.foreignGenre}</span> : null}
        {work.category === "外国文学" && work.author?.country ? <span>{work.author.country}</span> : null}
        {work.dynasty ? <span>{work.dynasty}</span> : null}
        {work.estimatedMinutes ? <span>约 {work.estimatedMinutes} 分钟</span> : null}
      </div>

      <h2 className="font-serif mt-4 break-words text-2xl leading-snug">
        <a className="underline-offset-4 hover:underline" href={`/work/${work.slug}`}>
          {work.title}
        </a>
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">{authorName}</p>
      <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--muted)]">{work.summary}</p>

      <div aria-label="适合心情" className="mt-5 flex flex-wrap gap-2">
        {work.moods.slice(0, 4).map((mood) => (
          <span key={mood}
            className="rounded-full bg-current/5 px-3 py-1.5 text-xs text-[var(--muted)]"
          >
            {mood}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <a
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-current/25 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
          href={`/work/${work.slug}`}
        >
          开始听读
          <span aria-hidden="true" className="ml-2">→</span>
        </a>
      </div>
    </article>
  );
}
