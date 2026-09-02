import type { DurationFilter } from "@/lib/content/types";
import {
  FOREIGN_LITERATURE_CATEGORY,
  isForeignLiteratureGenre,
} from "@/lib/content/foreign-literature";

const DURATION_VALUES: ReadonlySet<string> = new Set(["5", "10", "20", "30+"]);

export type WorksQuery = {
  category?: string;
  genre?: string;
  author?: string;
  q?: string;
  duration?: DurationFilter;
  mood?: string;
  page: number;
};

export type QueryResult =
  | { ok: true; value: WorksQuery }
  | { ok: false; message: string };

function optionalParam(searchParams: URLSearchParams, name: string) {
  const value = searchParams.get(name)?.trim();
  return value || undefined;
}

export function parseWorksQuery(searchParams: URLSearchParams): QueryResult {
  const pageValue = optionalParam(searchParams, "page");
  const page = pageValue === undefined ? 1 : Number(pageValue);

  if (!Number.isSafeInteger(page) || page < 1) {
    return { ok: false, message: "page 必须是大于等于 1 的整数。" };
  }

  const duration = optionalParam(searchParams, "duration");
  if (duration && !DURATION_VALUES.has(duration)) {
    return {
      ok: false,
      message: "duration 仅支持 5、10、20 或 30+。",
    };
  }

  const rawCategory = optionalParam(searchParams, "category");
  const rawGenre = optionalParam(searchParams, "genre");
  if (rawGenre && !isForeignLiteratureGenre(rawGenre)) {
    return { ok: false, message: "genre 不是支持的外国文学题材。" };
  }
  if (rawGenre && rawCategory && rawCategory !== FOREIGN_LITERATURE_CATEGORY) {
    return { ok: false, message: "genre 仅适用于外国文学分类。" };
  }

  return {
    ok: true,
    value: {
      category: rawGenre ? FOREIGN_LITERATURE_CATEGORY : rawCategory,
      genre: rawGenre,
      author: optionalParam(searchParams, "author"),
      q: optionalParam(searchParams, "q"),
      duration: duration as DurationFilter | undefined,
      mood: optionalParam(searchParams, "mood"),
      page,
    },
  };
}
