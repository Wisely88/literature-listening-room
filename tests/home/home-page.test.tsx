import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";
import { LIBRARY_CATEGORIES } from "@/components/library/library-options";

describe("home category shelf", () => {
  it("shows the real work count for every library category", async () => {
    render(await Home());

    const categoryNavigation = screen.getByRole("navigation", { name: "作品分类" });
    expect(categoryNavigation).not.toHaveTextContent("等待一篇好文章");
    expect(within(categoryNavigation).getAllByRole("link")).toHaveLength(
      LIBRARY_CATEGORIES.length,
    );

    for (const category of LIBRARY_CATEGORIES) {
      const label = within(categoryNavigation).getByText(category);
      expect(label.closest("a")).toHaveAttribute(
        "href",
        "/library?category=" + encodeURIComponent(category),
      );
    }

    expect(categoryNavigation).toHaveTextContent("古文15 篇已整理");
    expect(categoryNavigation).toHaveTextContent("外国文学51 篇已整理");
  });
});
