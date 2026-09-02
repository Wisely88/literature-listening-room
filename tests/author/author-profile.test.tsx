import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AuthorProfile } from "@/components/author/author-profile";
import { getAllWorks, getAuthorBySlug } from "@/lib/content/repository";

afterEach(cleanup);

async function loadSuShiProfile() {
  const author = await getAuthorBySlug("su-shi");
  if (!author) {
    throw new Error("测试需要苏轼作者资料。");
  }

  const works = await getAllWorks({ author: author.id });
  return { author, works };
}

describe("AuthorProfile", () => {
  it("renders the complete Su Shi profile and links only collected works", async () => {
    const { author, works } = await loadSuShiProfile();
    render(<AuthorProfile author={author} works={works} />);

    expect(screen.getByRole("heading", { level: 1, name: "苏轼" })).toBeVisible();
    expect(screen.getByText("子瞻、和仲")).toBeVisible();
    expect(screen.getByText("苏东坡、东坡居士")).toBeVisible();
    expect(screen.getByText("1037—1101")).toBeVisible();
    expect(screen.getByText("北宋 · 中国")).toBeVisible();

    const timeline = screen.getByRole("list", { name: "苏轼生平时间线" });
    expect(within(timeline).getAllByRole("listitem")).toHaveLength(14);

    const collectedWork = screen.getByRole("link", { name: /记承天寺夜游/ });
    expect(collectedWork).toHaveAttribute("href", "/work/ji-cheng-tian-si-ye-you");

    const relatedPeople = screen.getByRole("region", { name: "相关人物" });
    expect(within(relatedPeople).getByText("张怀民")).toBeVisible();
    expect(within(relatedPeople).queryAllByRole("link")).toHaveLength(0);
  });

  it("shows an honest empty state when an author has no collected work", async () => {
    const { author } = await loadSuShiProfile();
    render(<AuthorProfile author={author} works={[]} />);

    const collectedWorks = screen.getByRole("region", { name: "本站收录" });
    expect(within(collectedWorks).getByText("本站尚未收录这位作者的作品。")).toBeVisible();
    expect(within(collectedWorks).queryByRole("link", { name: /阅读全文/ })).toBeNull();
  });
});
