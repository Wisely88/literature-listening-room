import { describe, expect, it } from "vitest";
import {
  buildLibraryHref,
  hasActiveLibraryFilters,
  parseLibrarySearchParams,
  toWorkQuery,
} from "@/components/library/library-options";

describe("library URL filters", () => {
  it("trims supported query parameters and keeps the first repeated value", () => {
    const parsed = parseLibrarySearchParams({
      q: [" 苏轼 ", "忽略"],
      category: " 古文 ",
      author: " su-shi ",
      duration: "5",
      mood: "夜读",
      sort: "shortest",
    });

    expect(parsed).toEqual({
      q: "苏轼",
      category: "古文",
      genre: undefined,
      author: "su-shi",
      duration: "5",
      mood: "夜读",
      sort: "shortest",
    });
    expect(toWorkQuery(parsed)).toEqual(parsed);
    expect(hasActiveLibraryFilters(parsed)).toBe(true);
  });

  it("falls back safely when enum-like URL values are unsupported", () => {
    const parsed = parseLibrarySearchParams({
      category: "不存在",
      duration: "15",
      mood: "激动",
      sort: "favorite",
    });

    expect(parsed).toEqual({
      q: undefined,
      category: undefined,
      genre: undefined,
      author: undefined,
      duration: undefined,
      mood: undefined,
      sort: "recent",
    });
    expect(hasActiveLibraryFilters(parsed)).toBe(false);
  });

  it("builds shareable category links while preserving other filters", () => {
    const current = parseLibrarySearchParams({ q: "月夜", mood: "夜读" });

    expect(buildLibraryHref(current, { category: "古文" })).toBe(
      "/library?q=%E6%9C%88%E5%A4%9C&category=%E5%8F%A4%E6%96%87&mood=%E5%A4%9C%E8%AF%BB",
    );
    expect(buildLibraryHref(current, { q: undefined, mood: undefined })).toBe("/library");
  });

  it("parses and shares a foreign literature genre", () => {
    const current = parseLibrarySearchParams({
      category: "外国文学",
      genre: "科幻文学",
      mood: "夜读",
    });

    expect(current.category).toBe("外国文学");
    expect(current.genre).toBe("科幻文学");
    expect(buildLibraryHref(current, { genre: "历史文学" })).toBe(
      "/library?category=%E5%A4%96%E5%9B%BD%E6%96%87%E5%AD%A6&genre=%E5%8E%86%E5%8F%B2%E6%96%87%E5%AD%A6&mood=%E5%A4%9C%E8%AF%BB",
    );
    expect(buildLibraryHref(current, { category: "古文" })).toBe(
      "/library?category=%E5%8F%A4%E6%96%87&mood=%E5%A4%9C%E8%AF%BB",
    );
  });
});
