import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "@/app/page";

describe("project scaffold", () => {
  it("renders the product promise", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "今晚，听一篇好文章。" })).toBeVisible();
  });
});
