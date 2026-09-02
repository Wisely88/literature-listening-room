import { describe, expect, it } from "vitest";
import { GET as getWorks } from "@/app/api/works/route";
import { GET as getWork } from "@/app/api/works/[slug]/route";
import { GET as getAuthor } from "@/app/api/authors/[slug]/route";

describe("read-only content routes", () => {
  it("filters foreign literature by genre", async () => {
    const response = await getWorks(
      new Request(
        "http://localhost/api/works?category=%E5%A4%96%E5%9B%BD%E6%96%87%E5%AD%A6&genre=%E6%8E%A8%E7%90%86%E6%8E%A2%E6%A1%88",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.pagination.total).toBeGreaterThanOrEqual(5);
    expect(body.data.map((work: { slug: string }) => work.slug)).toEqual(
      expect.arrayContaining([
        "crime-and-punishment-room",
        "a-scandal-in-bohemia",
        "the-moonstone",
      ]),
    );
  });

  it("filters works and returns stable pagination metadata", async () => {
    const response = await getWorks(
      new Request(
        "http://localhost/api/works?q=%E8%8B%8F%E8%BD%BC&category=%E5%8F%A4%E6%96%87&duration=5&mood=%E5%A4%9C%E8%AF%BB",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.pagination).toMatchObject({
      page: 1,
      pageSize: 12,
      total: body.data.length,
      totalPages: 1,
    });
    expect(body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "ji-cheng-tian-si-ye-you",
          title: "记承天寺夜游",
        }),
      ]),
    );
  });

  it("returns the complete Golden Sample", async () => {
    const response = await getWork(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "ji-cheng-tian-si-ye-you" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.author.name).toBe("苏轼");
    expect(body.data.segments).toHaveLength(5);
    expect(body.data.annotations.length).toBeGreaterThan(0);
  });

  it("returns a structured 404 for an unknown work", async () => {
    const response = await getWork(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "missing-work" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "WORK_NOT_FOUND",
        message: "未找到作品：missing-work",
      },
    });
  });

  it("returns the author profile and a structured author 404", async () => {
    const found = await getAuthor(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "su-shi" }),
    });
    const missing = await getAuthor(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "missing-author" }),
    });

    expect(found.status).toBe(200);
    await expect(found.json()).resolves.toMatchObject({
      data: { slug: "su-shi", name: "苏轼" },
    });
    expect(missing.status).toBe(404);
    await expect(missing.json()).resolves.toMatchObject({
      error: { code: "AUTHOR_NOT_FOUND" },
    });
  });
});
