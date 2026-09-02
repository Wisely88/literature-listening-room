import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LibraryPage from "@/app/library/page";

describe("library page", () => {
  it("finds the Golden Sample by the author field", async () => {
    render(await LibraryPage({ searchParams: Promise.resolve({ q: "苏轼" }) }));

    expect(screen.getByRole("heading", { name: "分类书架", level: 1 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "记承天寺夜游" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "前赤壁赋" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "水调歌头·明月几时有" })).toBeVisible();
    expect(screen.getAllByRole("link", { name: /开始听读/ }).length).toBeGreaterThanOrEqual(3);
  });

  it("shows a truthful empty state for no matching results", async () => {
    render(await LibraryPage({ searchParams: Promise.resolve({ q: "不存在的作品名称" }) }));

    expect(
      screen.getByRole("heading", { name: "没有找到符合条件的作品" }),
    ).toBeVisible();
    expect(screen.queryByRole("heading", { name: "记承天寺夜游" })).not.toBeInTheDocument();
  });

  it("marks private-favorite sorting as unavailable instead of faking it", async () => {
    render(await LibraryPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("option", { name: "私人收藏（收藏阶段开放）" })).toBeDisabled();
  });

  it("shows and applies foreign literature genres", async () => {
    render(
      await LibraryPage({
        searchParams: Promise.resolve({ category: "外国文学", genre: "历史文学" }),
      }),
    );

    expect(screen.getByRole("navigation", { name: "外国文学题材分类" })).toBeVisible();
    const historyGenre = screen.getByRole("link", { name: /^历史文学\d+$/ });
    expect(historyGenre).toHaveAttribute("aria-current", "page");
    expect(Number(historyGenre.textContent?.match(/\d+/u)?.[0])).toBeGreaterThanOrEqual(5);
    expect(screen.getByRole("heading", { name: "双城记·时代与两座城市" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "罪与罚·炎热黄昏" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "傲慢与偏见·初来乍到" })).not.toBeInTheDocument();
  });
});
