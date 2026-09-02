import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserSpeechFallback } from "@/lib/tts/browser-speech-fallback";

class FakeUtterance {
  lang = "";
  rate = 1;
  pitch = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;

  constructor(readonly text: string) {}
}

describe("BrowserSpeechFallback", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("stays unavailable outside a supporting browser", () => {
    vi.stubGlobal("SpeechSynthesisUtterance", undefined);
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });

    const fallback = new BrowserSpeechFallback();
    expect(fallback.isSupported()).toBe(false);
    expect(fallback.speak("系统朗读")).toBe(false);
  });

  it("speaks only when explicitly called and supports playback controls", () => {
    const synthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      speaking: true,
      pending: false,
      paused: true,
    };
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synthesis });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: FakeUtterance,
    });

    const fallback = new BrowserSpeechFallback();
    expect(synthesis.speak).not.toHaveBeenCalled();
    expect(fallback.speak("  月色入户。  ", { rate: 0.9 })).toBe(true);
    expect(synthesis.speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "月色入户。", lang: "zh-CN", rate: 0.9 }),
    );
    expect(fallback.pause()).toBe(true);
    expect(fallback.resume()).toBe(true);
    expect(fallback.cancel()).toBe(true);
  });
});
