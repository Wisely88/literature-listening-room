import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AudioPlayer } from "@/components/player/audio-player";
import type { Work } from "@/lib/content/types";

const work: Work = {
  id: "work-1",
  slug: "work-1",
  title: "记承天寺夜游",
  aliases: [],
  authorId: "su-shi",
  category: "古文",
  language: "zh-CN",
  rightsStatus: "public-domain",
  summary: "",
  tags: [],
  moods: [],
  ambience: [],
  editorialNotes: [],
  pronunciationOverrides: [],
  background: "",
  translation: "",
  appreciation: "",
  annotations: [],
  segments: [{ id: "seg-1", order: 1, displayText: "月色入户。" }],
};

afterEach(() => {
  Reflect.deleteProperty(window, "speechSynthesis");
  Reflect.deleteProperty(window, "SpeechSynthesisUtterance");
});

it("shows the formal-audio empty state and starts fallback only after an explicit click", async () => {
  const speak = vi.fn();
  const cancel = vi.fn();
  class FakeUtterance {
    lang = "";
    rate = 1;
    pitch = 1;
    volume = 1;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: ((event: Event) => void) | null = null;
    constructor(public text: string) {}
  }

  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { cancel, pause: vi.fn(), resume: vi.fn(), speak, speaking: false, pending: false, paused: false },
  });
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: FakeUtterance,
  });

  render(<AudioPlayer manifest={null} work={work} />);

  expect(screen.getByRole("heading", { name: "本篇还没有生成自然朗读" })).toBeInTheDocument();
  const fallbackButton = await screen.findByRole("button", { name: "使用系统朗读" });
  expect(speak).not.toHaveBeenCalled();
  fireEvent.click(fallbackButton);
  expect(speak).toHaveBeenCalledTimes(1);
});
