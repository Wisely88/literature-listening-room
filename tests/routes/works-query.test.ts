import { describe, expect, it } from "vitest";
import { parseWorksQuery } from "@/app/api/works/query";

describe("parseWorksQuery", () => {
  it("parses supported filters and trims text values", () => {
    const result = parseWorksQuery(
      new URLSearchParams({
        category: " 古文 ",
        author: "su-shi",
        q: " 月色 ",
        duration: "5",
        mood: "夜读",
        page: "2",
      }),
    );

    expect(result).toEqual({
      ok: true,
      value: {
        category: "古文",
        genre: undefined,
        author: "su-shi",
        q: "月色",
        duration: "5",
        mood: "夜读",
        page: 2,
      },
    });
  });

  it.each(["0", "-1", "1.5", "abc"])("rejects invalid page %s", (page) => {
    const result = parseWorksQuery(new URLSearchParams({ page }));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("page");
    }
  });

  it("rejects unsupported duration buckets", () => {
    const result = parseWorksQuery(new URLSearchParams({ duration: "15" }));

    expect(result).toEqual({
      ok: false,
      message: "duration 仅支持 5、10、20 或 30+。",
    });
  });

  it("parses a supported foreign literature genre", () => {
    const result = parseWorksQuery(
      new URLSearchParams({ category: "外国文学", genre: "推理探案" }),
    );

    expect(result).toEqual({
      ok: true,
      value: {
        category: "外国文学",
        genre: "推理探案",
        author: undefined,
        q: undefined,
        duration: undefined,
        mood: undefined,
        page: 1,
      },
    });
  });

  it("rejects an unsupported foreign literature genre", () => {
    expect(parseWorksQuery(new URLSearchParams({ genre: "火星文学" }))).toEqual({
      ok: false,
      message: "genre 不是支持的外国文学题材。",
    });
  });
});
