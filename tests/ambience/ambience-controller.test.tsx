import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AmbienceController } from "@/components/ambience/ambience-controller";

class FakeAudio {
  loop = false;
  preload = "";
  volume = 0;
  src = "";
  pause = vi.fn();
  play = vi.fn().mockResolvedValue(undefined);
  removeAttribute = vi.fn();
}

function runAnimationFrame() {
  return 1;
}

describe("AmbienceController", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("Audio", FakeAudio);
    vi.stubGlobal("requestAnimationFrame", runAnimationFrame);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("默认选中雨声并可开启关闭", async () => {
    const user = userEvent.setup();
    render(<AmbienceController defaultScene="rain" />);

    expect(screen.getByRole("button", { name: "雨声" })).toHaveAttribute("aria-pressed", "true");
    for (const label of ["海浪", "篝火", "夜虫", "风声"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
    const toggle = screen.getByRole("button", { name: "开启" });
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "关闭" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "海浪" }));
    expect(screen.getByRole("heading", { name: "海浪" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "海浪音量" })).toBeInTheDocument();
  });

  it("把音量写入本地存储", () => {
    render(<AmbienceController defaultScene="rain" />);
    const slider = screen.getByRole("slider", { name: "雨声音量" });
    expect(slider).toHaveAttribute("value", "0.22");
  });
});
