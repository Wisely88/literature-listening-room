import Link from "next/link";
import type { Author, Work } from "@/lib/content/types";

export type CollectedWork = Pick<
  Work,
  "slug" | "title" | "category" | "estimatedMinutes" | "summary"
>;

type AuthorProfileProps = {
  author: Author;
  works: CollectedWork[];
};

function formatLifeSpan(author: Author): string {
  if (author.birthYear === undefined && author.deathYear === undefined) {
    return "生卒年待考";
  }

  return `${author.birthYear ?? "?"}—${author.deathYear ?? "?"}`;
}

function formatEra(author: Author): string {
  const era = [author.dynasty, author.country].filter(Boolean);
  return era.length > 0 ? era.join(" · ") : "时代待考";
}

export function AuthorProfile({ author, works }: AuthorProfileProps) {
  const profileTitleId = `author-${author.slug}-title`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl overflow-x-clip px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-16">
      <Link
        className="inline-flex min-h-11 items-center text-sm text-[var(--muted)] underline-offset-4 transition-colors hover:text-[var(--ink)] hover:underline"
        href="/"
      >
        ← 返回听读馆
      </Link>

      <article aria-labelledby={profileTitleId} className="mt-6 sm:mt-9">
        <header className="border-b border-current/15 pb-9 sm:pb-12">
          <p className="text-sm tracking-[0.16em] text-[var(--muted)]">作者档案</p>
          <div className="mt-4 grid min-w-0 gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="min-w-0">
              <h1
                className="font-serif text-5xl leading-tight sm:text-6xl"
                id={profileTitleId}
              >
                {author.name}
              </h1>
              <div className="mt-5 space-y-2 text-sm leading-6 text-[var(--muted)] sm:text-base">
                {author.courtesyNames.length > 0 ? (
                  <p>
                    <span className="text-[var(--ink)]">字</span>
                    <span aria-hidden="true"> · </span>
                    {author.courtesyNames.join("、")}
                  </p>
                ) : null}
                {author.aliases.length > 0 ? (
                  <p>
                    <span className="text-[var(--ink)]">别名与别号</span>
                    <span aria-hidden="true"> · </span>
                    {author.aliases.join("、")}
                  </p>
                ) : null}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 border-l-0 border-current/15 text-sm md:border-l md:pl-8">
              <div>
                <dt className="text-[var(--muted)]">生卒</dt>
                <dd className="font-serif mt-1 text-lg">{formatLifeSpan(author)}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">时代</dt>
                <dd className="font-serif mt-1 text-lg">{formatEra(author)}</dd>
              </div>
            </dl>
          </div>
        </header>

        <div className="grid gap-8 py-9 md:grid-cols-2 sm:py-12">
          <section aria-labelledby="author-bio-title">
            <p className="text-xs tracking-[0.14em] text-[var(--muted)]">其人</p>
            <h2 className="font-serif mt-2 text-2xl" id="author-bio-title">
              生平简介
            </h2>
            <p className="font-serif mt-4 text-lg leading-8">{author.bio}</p>
          </section>

          {author.styleSummary ? (
            <section
              aria-labelledby="author-style-title"
              className="border-t border-current/15 pt-8 md:border-l md:border-t-0 md:pl-8 md:pt-0"
            >
              <p className="text-xs tracking-[0.14em] text-[var(--muted)]">其文</p>
              <h2 className="font-serif mt-2 text-2xl" id="author-style-title">
                文学风格
              </h2>
              <p className="font-serif mt-4 text-lg leading-8">{author.styleSummary}</p>
            </section>
          ) : null}
        </div>

        <section
          aria-labelledby="collected-works-title"
          className="border-y border-current/15 py-9 sm:py-11"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div>
              <p className="text-xs tracking-[0.14em] text-[var(--muted)]">从这里继续听读</p>
              <h2 className="font-serif mt-2 text-2xl" id="collected-works-title">
                本站收录
              </h2>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {works.length > 0 ? `共 ${works.length} 篇` : "仍在安静整理中"}
            </p>
          </div>

          {works.length > 0 ? (
            <ul aria-label={`${author.name}本站收录作品`} className="mt-6 grid gap-4">
              {works.map((work) => (
                <li key={work.slug}>
                  <Link
                    className="group grid min-h-11 gap-5 rounded-2xl border border-current/15 p-5 transition-colors hover:border-current/35 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6"
                    href={`/work/${work.slug}`}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm text-[var(--muted)]">
                        {work.category}
                        {work.estimatedMinutes ? ` · 约 ${work.estimatedMinutes} 分钟` : ""}
                      </span>
                      <span className="font-serif mt-2 block text-2xl leading-snug">
                        《{work.title}》
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">
                        {work.summary}
                      </span>
                    </span>
                    <span className="inline-flex min-h-11 items-center text-sm underline-offset-4 group-hover:underline">
                      阅读全文 →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-current/20 px-5 py-6 leading-7 text-[var(--muted)]">
              本站尚未收录这位作者的作品。
            </p>
          )}
        </section>

        <div className="grid min-w-0 gap-12 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,0.85fr)] lg:gap-16">
          <section aria-labelledby="author-timeline-title" className="min-w-0">
            <p className="text-xs tracking-[0.14em] text-[var(--muted)]">一生行旅</p>
            <h2 className="font-serif mt-2 text-2xl" id="author-timeline-title">
              生平时间线
            </h2>

            {author.timeline.length > 0 ? (
              <ol
                aria-label={`${author.name}生平时间线`}
                className="mt-7 border-l border-current/20 pl-6 sm:pl-8"
              >
                {author.timeline.map((item) => (
                  <li className="relative pb-7 last:pb-0" key={`${item.year}-${item.title}`}>
                    <span
                      aria-hidden="true"
                      className="absolute -left-[1.72rem] top-2 size-2.5 rounded-full bg-[var(--ink)] sm:-left-[2.22rem]"
                    />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <time
                        className="font-serif text-lg tabular-nums"
                        dateTime={String(item.year)}
                      >
                        {item.year}
                      </time>
                      <h3 className="text-base font-medium">{item.title}</h3>
                    </div>
                    <p className="mt-2 leading-7 text-[var(--muted)]">{item.description}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-6 leading-7 text-[var(--muted)]">生平资料仍在整理。</p>
            )}
          </section>

          <div className="min-w-0 space-y-12">
            <section aria-labelledby="representative-works-title">
              <p className="text-xs tracking-[0.14em] text-[var(--muted)]">作品谱系</p>
              <h2 className="font-serif mt-2 text-2xl" id="representative-works-title">
                代表作品
              </h2>

              {author.representativeWorks.length > 0 ? (
                <ul
                  aria-label={`${author.name}代表作品`}
                  className="mt-5 divide-y divide-current/15 border-y border-current/15"
                >
                  {author.representativeWorks.map((work) => (
                    <li
                      className="flex min-w-0 items-baseline justify-between gap-4 py-3.5"
                      key={`${work.type}-${work.title}`}
                    >
                      <span className="font-serif min-w-0 break-words">《{work.title}》</span>
                      <span className="shrink-0 text-xs text-[var(--muted)]">{work.type}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 leading-7 text-[var(--muted)]">代表作品资料仍在整理。</p>
              )}
            </section>

            <section aria-labelledby="related-people-title">
              <p className="text-xs tracking-[0.14em] text-[var(--muted)]">同路与相望</p>
              <h2 className="font-serif mt-2 text-2xl" id="related-people-title">
                相关人物
              </h2>

              {author.relatedPeople.length > 0 ? (
                <ul className="mt-5 space-y-5" aria-label={`${author.name}相关人物`}>
                  {author.relatedPeople.map((person) => (
                    <li className="border-l border-current/20 pl-4" key={person.id}>
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <h3 className="font-serif text-lg">{person.name}</h3>
                        <p className="text-xs text-[var(--muted)]">{person.relationship}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{person.summary}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 leading-7 text-[var(--muted)]">相关人物资料仍在整理。</p>
              )}
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}
