"use client";

import { useEffect, useState } from "react";

type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "literature-theme";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function resolveTheme(preference: ThemePreference, media: MediaQueryList): "light" | "dark" {
  return preference === "system" ? (media.matches ? "dark" : "light") : preference;
}

function applyTheme(preference: ThemePreference, media: MediaQueryList): void {
  document.documentElement.dataset.theme = resolveTheme(preference, media);
  document.documentElement.dataset.themePreference = preference;
}

export function ThemeSwitcher() {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "system";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(preference, media);

    const handleSystemChange = () => {
      if (preference === "system") applyTheme("system", media);
    };
    media.addEventListener("change", handleSystemChange);
    return () => media.removeEventListener("change", handleSystemChange);
  }, [preference]);

  function handleChange(nextPreference: ThemePreference) {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    window.localStorage.setItem(STORAGE_KEY, nextPreference);
    setPreference(nextPreference);
    applyTheme(nextPreference, media);
  }

  return (
    <label className="theme-control">
      <span className="sr-only">阅读主题</span>
      <select
        aria-label="阅读主题"
        className="theme-select"
        onChange={(event) => handleChange(event.target.value as ThemePreference)}
        suppressHydrationWarning
        value={preference}
      >
        <option value="system">跟随系统</option>
        <option value="light">浅色</option>
        <option value="dark">深色</option>
      </select>
    </label>
  );
}
