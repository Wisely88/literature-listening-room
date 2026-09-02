import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FavoritesPage from "@/app/favorites/page";
import HistoryPage from "@/app/history/page";

vi.mock("@/lib/library/personal-data", () => ({
  listFavorites: async () => [{ workId: "ji-cheng-tian-si-ye-you", createdAt: new Date() }],
  listRecentProgress: async () => [
    {
      workId: "ji-cheng-tian-si-ye-you",
      segmentId: "seg-003",
      positionMs: 1200,
      completed: false,
      lastOpenedAt: new Date(),
    },
  ],
}));

describe("personal pages", () => {
  it("renders collected works on the favorites page", async () => {
    render(await FavoritesPage());

    expect(screen.getByRole("heading", { name: "想再听一遍的", level: 1 })).toBeVisible();
    expect(screen.getByRole("heading", { name: "记承天寺夜游" })).toBeVisible();
    expect(screen.getByText("共 1 篇")).toBeVisible();
  });

  it("renders playback progress on the history page", async () => {
    render(await HistoryPage());

    expect(screen.getByRole("heading", { name: "从上次停下的地方继续", level: 1 })).toBeVisible();
    expect(screen.getByRole("link", { name: /记承天寺夜游/ })).toBeVisible();
    expect(screen.getByText("听到第 3 段")).toBeVisible();
  });
});
