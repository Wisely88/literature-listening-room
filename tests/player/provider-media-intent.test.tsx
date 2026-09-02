import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlayerProvider, usePlayer } from "@/lib/player";
import type { AudioManifest } from "@/lib/tts";

class FakeAudio {
  static instances: FakeAudio[] = [];

  currentTime = 0;
  duration = 30;
  preload = "";
  readyState = 1;
  playbackRate = 1;
  volume = 1;
  private source = "";
  private readonly listeners = new Map<string, Set<() => void>>();

  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn(() => this.emit("pause"));
  load = vi.fn();
  removeAttribute = vi.fn((name: string) => {
    if (name === "src") this.source = "";
  });

  constructor() {
    FakeAudio.instances.push(this);
  }

  get src() {
    return this.source;
  }

  set src(value: string) {
    this.source = value;
  }

  addEventListener(name: string, listener: () => void) {
    const group = this.listeners.get(name) ?? new Set<() => void>();
    group.add(listener);
    this.listeners.set(name, group);
  }

  removeEventListener(name: string, listener: () => void) {
    this.listeners.get(name)?.delete(listener);
  }

  emit(name: string) {
    this.listeners.get(name)?.forEach((listener) => listener());
  }
}

const manifest: AudioManifest = {
  version: 1,
  workId: "work-1",
  provider: "edge-neural",
  voice: "test-voice",
  format: "mp3",
  segments: [
    {
      id: "seg-1",
      url: "/audio/work-1/seg-1.mp3",
      durationMs: 30_000,
    },
  ],
};

function Harness() {
  const player = usePlayer();
  return (
    <>
      <output aria-label="状态">{player.state.status}</output>
      <button onClick={player.toggle} type="button">切换播放</button>
      <button onClick={() => player.setVolume(0.5)} type="button">调整音量</button>
    </>
  );
}

describe("PlayerProvider media intent", () => {
  beforeEach(() => {
    FakeAudio.instances = [];
    vi.stubGlobal("Audio", FakeAudio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("can pause while playback is still loading", async () => {
    const user = userEvent.setup();
    render(
      <PlayerProvider manifest={manifest} segments={[]} workId="work-1">
        <Harness />
      </PlayerProvider>,
    );

    const audio = FakeAudio.instances[0]!;
    audio.pause.mockClear();
    audio.play.mockClear();

    await user.click(screen.getByRole("button", { name: "切换播放" }));
    expect(screen.getByLabelText("状态")).toHaveTextContent("loading");

    await user.click(screen.getByRole("button", { name: "切换播放" }));
    expect(audio.pause).toHaveBeenCalledTimes(1);
    expect(audio.play).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("状态")).toHaveTextContent("paused");
  });

  it("does not reload the segment when volume changes", async () => {
    const user = userEvent.setup();
    render(
      <PlayerProvider manifest={manifest} segments={[]} workId="work-1">
        <Harness />
      </PlayerProvider>,
    );

    const audio = FakeAudio.instances[0]!;
    const source = audio.src;
    audio.pause.mockClear();

    await user.click(screen.getByRole("button", { name: "调整音量" }));

    expect(audio.src).toBe(source);
    expect(audio.volume).toBe(0.5);
    expect(audio.pause).not.toHaveBeenCalled();
  });
});
