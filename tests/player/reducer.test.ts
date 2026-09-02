import { describe, expect, it } from "vitest";
import {
  getElapsedTime,
  getTotalDuration,
  initialPlayerState,
  playerReducer,
} from "@/lib/player";

function loadedState() {
  return playerReducer(initialPlayerState, {
    type: "load-work",
    workId: "work-1",
    segmentIds: ["seg-1", "seg-2", "seg-3"],
    segmentDurations: [10, 20, 30],
  });
}

describe("playerReducer", () => {
  it("loads a work with manifest durations", () => {
    const state = loadedState();
    expect(state).toMatchObject({
      workId: "work-1",
      segmentIndex: 0,
      duration: 10,
      status: "idle",
    });
    expect(getTotalDuration(state)).toBe(60);
  });

  it("seeks forward across a segment boundary", () => {
    const state = playerReducer(loadedState(), { type: "seek", absoluteTime: 15 });
    expect(state.segmentIndex).toBe(1);
    expect(state.currentTime).toBe(5);
    expect(getElapsedTime(state)).toBe(15);
  });

  it("seeks backward across a segment boundary", () => {
    let state = playerReducer(loadedState(), {
      type: "select-segment",
      segmentIndex: 2,
      currentTime: 4,
    });
    state = playerReducer(state, { type: "seek", absoluteTime: getElapsedTime(state) - 15 });
    expect(state.segmentIndex).toBe(1);
    expect(state.currentTime).toBe(9);
  });

  it("continues with the next segment and ends only after the last", () => {
    let state = playerReducer(loadedState(), { type: "segment-ended" });
    expect(state).toMatchObject({ segmentIndex: 1, status: "loading", currentTime: 0 });

    state = playerReducer(state, { type: "select-segment", segmentIndex: 2 });
    state = playerReducer(state, { type: "segment-ended" });
    expect(state).toMatchObject({ segmentIndex: 2, status: "ended", currentTime: 30 });
  });

  it("exposes a recoverable error and clamps media settings", () => {
    let state = playerReducer(loadedState(), { type: "set-error", message: "音频暂时无法加载" });
    expect(state).toMatchObject({ status: "error", error: "音频暂时无法加载" });

    state = playerReducer(state, { type: "retry" });
    state = playerReducer(state, { type: "set-rate", rate: 1.5 });
    state = playerReducer(state, { type: "set-volume", volume: 2 });
    expect(state).toMatchObject({ status: "loading", error: undefined, rate: 1.5, volume: 1 });
  });
});
