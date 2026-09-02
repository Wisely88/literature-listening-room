import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ContentValidationError,
  getAllWorks,
  getAuthorBySlug,
  parseAnnotationsJson,
  parseWorkMarkdown,
  validateRightsStatus,
} from "@/lib/content";

const contentDir = path.join(process.cwd(), "content");
const workPath = path.join(contentDir, "works", "ji-cheng-tian-si-ye-you.md");
const annotationsPath = path.join(
  contentDir,
  "works",
  "ji-cheng-tian-si-ye-you.annotations.json",
);

describe("Golden Sample content", () => {
  it("parses five aligned original and translation segments", async () => {
    const [markdown, annotationSource] = await Promise.all([
      readFile(workPath, "utf8"),
      readFile(annotationsPath, "utf8"),
    ]);
    const annotations = parseAnnotationsJson(annotationSource);
    const { work, warnings } = parseWorkMarkdown(markdown, { annotations, sourcePath: workPath });

    expect(warnings).toEqual([]);
    expect(work.title).toBe("记承天寺夜游");
    expect(work.segments).toHaveLength(5);
    expect(work.segments.every((segment) => Boolean(segment.translation))).toBe(true);
    expect(work.annotations).toHaveLength(23);
    expect(work.background).toContain("黄州");
  });

  it("joins the author and finds the work by author name", async () => {
    const [works, aliasWorks, author] = await Promise.all([
      getAllWorks({ q: "苏轼" }),
      getAllWorks({ q: "东坡居士" }),
      getAuthorBySlug("su-shi"),
    ]);

    const slugs = works.map((work) => work.slug);
    expect(slugs).toEqual(expect.arrayContaining([
      "ji-cheng-tian-si-ye-you",
      "qian-chi-bi-fu",
      "shui-diao-ge-tou",
    ]));
    expect(aliasWorks.map((work) => work.slug)).toEqual(slugs);
    expect(works.every((work) => work.author?.name === "苏轼")).toBe(true);
    expect(author?.timeline).toHaveLength(14);
  });

  it("warns privately but rejects unknown rights in public mode", () => {
    expect(validateRightsStatus("unknown")).toEqual([
      expect.objectContaining({ code: "rights-status-unknown" }),
    ]);
    expect(() => validateRightsStatus("unknown", { mode: "public" })).toThrow(
      ContentValidationError,
    );
  });

  it("rejects a work without original text", () => {
    expect(() =>
      parseWorkMarkdown(`---\nid: x\nslug: x\ntitle: X\nauthorId: a\ncategory: 古文\nrightsStatus: public-domain\nsummary: x\n---\n\n## 白话\n\n空`),
    ).toThrow("作品缺少“原文”内容。");
  });
});
