import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

function installMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener: (_event: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_event: string, listener: () => void) => listeners.delete(listener),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    installMatchMedia(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("跟随系统深色偏好", async () => {
    render(<ThemeSwitcher />);

    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
    expect(screen.getByRole("combobox", { name: "阅读主题" })).toHaveValue("system");
  });

  it("保存用户选择并切换主题", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    await user.selectOptions(screen.getByRole("combobox", { name: "阅读主题" }), "light");

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("literature-theme")).toBe("light");
  });
});
