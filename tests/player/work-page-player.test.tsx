import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkPage from "@/app/work/[slug]/page";

vi.mock("@/lib/library/personal-data", () => ({
  isFavorite: async () => false,
  getProgress: async () => null,
}));

describe("work page audio player", () => {
  it("mounts the formal player for the Golden Sample", async () => {
    render(
      await WorkPage({
        params: Promise.resolve({ slug: "ji-cheng-tian-si-ye-you" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "记承天寺夜游", level: 1 })).toBeVisible();
    expect(screen.getByRole("region", { name: "记承天寺夜游自然朗读播放器" })).toBeVisible();
    expect(screen.getByRole("button", { name: "播放" })).toBeVisible();
    expect(screen.queryByRole("heading", { name: "本篇还没有生成自然朗读" })).not.toBeInTheDocument();
  });
});
