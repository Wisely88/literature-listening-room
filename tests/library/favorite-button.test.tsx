import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FavoriteButton } from "@/components/library/favorite-button";

describe("FavoriteButton", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("从已收藏状态取消收藏", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<FavoriteButton initialFavorited={true} workId="work-1" />);
    await user.click(screen.getByRole("button", { name: /已收藏/ }));

    expect(fetchMock).toHaveBeenCalledWith("/api/favorites/work-1", { method: "DELETE" });
    expect(screen.getByRole("button", { name: /收藏/ })).toHaveAttribute("aria-pressed", "false");
  });

  it("从未收藏状态添加收藏", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();

    render(<FavoriteButton initialFavorited={false} workId="work-1" />);
    await user.click(screen.getByRole("button", { name: /^收藏$/ }));

    expect(fetchMock).toHaveBeenCalledWith("/api/favorites/work-1", { method: "POST" });
    expect(screen.getByRole("button", { name: /已收藏/ })).toHaveAttribute("aria-pressed", "true");
  });
});
