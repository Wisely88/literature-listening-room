"use client";

export type BrowserSpeechOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: SpeechSynthesisErrorEvent) => void;
};

type BrowserSpeechEnvironment = {
  synthesis: SpeechSynthesis;
  Utterance: typeof SpeechSynthesisUtterance;
};

function getBrowserSpeechEnvironment(): BrowserSpeechEnvironment | undefined {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof window.SpeechSynthesisUtterance !== "function"
  ) {
    return undefined;
  }

  return {
    synthesis: window.speechSynthesis,
    Utterance: window.SpeechSynthesisUtterance,
  };
}

/**
 * Explicit, user-selected fallback for works without pre-generated audio.
 * It never returns an audio URL and must not be used as a formal TTS provider.
 */
export class BrowserSpeechFallback {
  private activeUtterance?: SpeechSynthesisUtterance;

  constructor(private readonly environment = getBrowserSpeechEnvironment) {}

  isSupported(): boolean {
    return this.environment() !== undefined;
  }

  speak(text: string, options: BrowserSpeechOptions = {}): boolean {
    const environment = this.environment();
    const normalizedText = text.trim();

    if (!environment || !normalizedText) {
      return false;
    }

    environment.synthesis.cancel();

    const utterance = new environment.Utterance(normalizedText);
    utterance.lang = options.lang ?? "zh-CN";
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    if (options.voice) utterance.voice = options.voice;
    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;

    this.activeUtterance = utterance;
    environment.synthesis.speak(utterance);
    return true;
  }

  pause(): boolean {
    const synthesis = this.environment()?.synthesis;
    if (!synthesis || (!synthesis.speaking && !synthesis.pending)) return false;
    synthesis.pause();
    return true;
  }

  resume(): boolean {
    const synthesis = this.environment()?.synthesis;
    if (!synthesis || !synthesis.paused) return false;
    synthesis.resume();
    return true;
  }

  cancel(): boolean {
    const synthesis = this.environment()?.synthesis;
    if (!synthesis) return false;
    synthesis.cancel();
    this.activeUtterance = undefined;
    return true;
  }
}
