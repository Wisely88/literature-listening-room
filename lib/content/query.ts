import type { DurationFilter, Work, WorkQuery, WorkSort } from "./types";

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase("zh-CN");
}

export function searchWorks(works: Work[], query: string): Work[] {
  const needle = normalized(query);
  if (!needle) return works;

  return works.filter((work) => {
    const fields = [
      work.title,
      work.author?.name,
      work.category,
      work.author?.country,
      work.foreignGenre,
      work.dynasty,
      work.summary,
      ...work.aliases,
      ...work.tags,
      ...(work.author?.aliases ?? []),
      ...(work.author?.courtesyNames ?? []),
    ];
    return fields.some((field) => field && normalized(field).includes(needle));
  });
}

export function filterWorksByDuration(works: Work[], duration: DurationFilter): Work[] {
  return works.filter((work) => {
    const minutes = work.estimatedMinutes;
    if (minutes === undefined) return false;
    if (duration === "5") return minutes <= 5;
    if (duration === "10") return minutes > 5 && minutes <= 10;
    if (duration === "20") return minutes > 10 && minutes <= 20;
    return minutes >= 30;
  });
}

export function sortWorks(works: Work[], sort: WorkSort): Work[] {
  const copy = [...works];
  if (sort === "shortest") {
    return copy.sort((a, b) => (a.estimatedMinutes ?? Infinity) - (b.estimatedMinutes ?? Infinity));
  }
  if (sort === "longest") {
    return copy.sort((a, b) => (b.estimatedMinutes ?? -1) - (a.estimatedMinutes ?? -1));
  }
  return copy;
}

export function queryWorks(works: Work[], query: WorkQuery = {}): Work[] {
  let result = works;
  if (query.q) result = searchWorks(result, query.q);
  if (query.category) result = result.filter((work) => work.category === query.category);
  if (query.genre) result = result.filter((work) => work.foreignGenre === query.genre);
  if (query.author) {
    const author = normalized(query.author);
    result = result.filter(
      (work) =>
        normalized(work.authorId) === author ||
        normalized(work.author?.slug ?? "") === author ||
        normalized(work.author?.name ?? "").includes(author),
    );
  }
  if (query.mood) result = result.filter((work) => work.moods.includes(query.mood!));
  if (query.duration) result = filterWorksByDuration(result, query.duration);
  return sortWorks(result, query.sort ?? "recent");
}
