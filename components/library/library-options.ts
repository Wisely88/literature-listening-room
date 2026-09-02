import type { DurationFilter, WorkQuery, WorkSort } from "@/lib/content/types";
import {
  FOREIGN_LITERATURE_CATEGORY,
  isForeignLiteratureGenre,
  type ForeignLiteratureGenre,
} from "@/lib/content/foreign-literature";

export const LIBRARY_CATEGORIES = [
  "古文",
  "诗词",
  "经典小说",
  "散文",
  "志怪怪谈",
  "推理探案",
  "恐怖惊悚",
  "传记 / 自传",
  "历史小品",
  "思想随笔",
  "外国文学",
  "优秀文章",
] as const;

export const LIBRARY_MOODS = ["放松", "夜读", "来点刺激", "想点事情", "古典"] as const;

export const DURATION_OPTIONS: ReadonlyArray<{ value: DurationFilter; label: string }> = [
  { value: "5", label: "5 分钟内" },
  { value: "10", label: "6–10 分钟" },
  { value: "20", label: "11–20 分钟" },
  { value: "30+", label: "30 分钟以上" },
];

export const SORT_OPTIONS: ReadonlyArray<{ value: WorkSort; label: string }> = [
  { value: "recent", label: "最近加入" },
  { value: "shortest", label: "朗读最短" },
  { value: "longest", label: "朗读最长" },
];

type SearchValue = string | string[] | undefined;

export type LibrarySearchParams = {
  q?: string;
  category?: string;
  genre?: ForeignLiteratureGenre;
  author?: string;
  duration?: DurationFilter;
  mood?: string;
  sort: WorkSort;
};

function firstTrimmed(value: SearchValue): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();
  return trimmed || undefined;
}

export function parseLibrarySearchParams(
  input: Record<string, SearchValue>,
): LibrarySearchParams {
  const rawCategory = firstTrimmed(input.category);
  const rawGenre = firstTrimmed(input.genre);
  const rawDuration = firstTrimmed(input.duration);
  const rawMood = firstTrimmed(input.mood);
  const rawSort = firstTrimmed(input.sort);

  const category = LIBRARY_CATEGORIES.some((value) => value === rawCategory)
    ? rawCategory
    : undefined;
  const genre =
    category === FOREIGN_LITERATURE_CATEGORY && isForeignLiteratureGenre(rawGenre)
      ? rawGenre
      : undefined;
  const duration = DURATION_OPTIONS.some((option) => option.value === rawDuration)
    ? (rawDuration as DurationFilter)
    : undefined;
  const mood = LIBRARY_MOODS.some((value) => value === rawMood) ? rawMood : undefined;
  const sort = SORT_OPTIONS.some((option) => option.value === rawSort)
    ? (rawSort as WorkSort)
    : "recent";

  return {
    q: firstTrimmed(input.q),
    category,
    genre,
    author: firstTrimmed(input.author),
    duration,
    mood,
    sort,
  };
}

export function toWorkQuery(params: LibrarySearchParams): WorkQuery {
  return {
    q: params.q,
    category: params.category,
    genre: params.genre,
    author: params.author,
    duration: params.duration,
    mood: params.mood,
    sort: params.sort,
  };
}

export function hasActiveLibraryFilters(params: LibrarySearchParams): boolean {
  return Boolean(
    params.q || params.category || params.genre || params.author || params.duration || params.mood,
  );
}

export function buildLibraryHref(
  current: LibrarySearchParams,
  changes: Partial<Record<keyof LibrarySearchParams, string | undefined>>,
): string {
  const next = { ...current, ...changes };
  if ("category" in changes && changes.category !== FOREIGN_LITERATURE_CATEGORY) {
    next.genre = undefined;
  } else if (next.genre) {
    next.category = FOREIGN_LITERATURE_CATEGORY;
  }
  if (next.category !== FOREIGN_LITERATURE_CATEGORY) next.genre = undefined;
  const query = new URLSearchParams();

  for (const key of ["q", "category", "genre", "author", "duration", "mood", "sort"] as const) {
    const value = next[key];
    if (value && !(key === "sort" && value === "recent")) query.set(key, value);
  }

  const encoded = query.toString();
  return encoded ? `/library?${encoded}` : "/library";
}
