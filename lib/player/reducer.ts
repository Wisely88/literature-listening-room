import {
  PLAYBACK_RATES,
  type PlaybackRate,
  type PlayerAction,
  type PlayerState,
} from "./types";

export const initialPlayerState: PlayerState = {
  workId: null,
  segmentIds: [],
  segmentDurations: [],
  segmentIndex: 0,
  status: "idle",
  currentTime: 0,
  duration: 0,
  rate: 1,
  volume: 1,
};

function finiteSeconds(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function durationAt(state: PlayerState, index: number): number {
  return finiteSeconds(state.segmentDurations[index] ?? 0);
}

export function getTotalDuration(state: PlayerState): number {
  return state.segmentDurations.reduce((total, duration) => total + finiteSeconds(duration), 0);
}

export function getElapsedTime(state: PlayerState): number {
  const completed = state.segmentDurations
    .slice(0, state.segmentIndex)
    .reduce((total, duration) => total + finiteSeconds(duration), 0);
  return completed + Math.min(finiteSeconds(state.currentTime), durationAt(state, state.segmentIndex));
}

export function locateAbsoluteTime(
  state: PlayerState,
  absoluteTime: number,
): { segmentIndex: number; currentTime: number } {
  const lastIndex = Math.max(0, state.segmentIds.length - 1);
  const total = getTotalDuration(state);
  let remaining = Math.min(finiteSeconds(absoluteTime), total);

  for (let index = 0; index < state.segmentIds.length; index += 1) {
    const duration = durationAt(state, index);
    if (remaining < duration || index === lastIndex) {
      return { segmentIndex: index, currentTime: Math.min(remaining, duration) };
    }
    remaining -= duration;
  }

  return { segmentIndex: lastIndex, currentTime: durationAt(state, lastIndex) };
}

function validRate(rate: number): PlaybackRate {
  return PLAYBACK_RATES.includes(rate as PlaybackRate) ? (rate as PlaybackRate) : 1;
}

export function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case "load-work": {
      const segmentDurations = action.segmentIds.map((_, index) =>
        finiteSeconds(action.segmentDurations[index] ?? 0),
      );
      return {
        ...initialPlayerState,
        workId: action.workId,
        segmentIds: action.segmentIds,
        segmentDurations,
        duration: segmentDurations[0] ?? 0,
        rate: state.rate,
        volume: state.volume,
      };
    }
    case "set-status":
      return { ...state, status: action.status, error: undefined };
    case "time-update":
      return {
        ...state,
        currentTime: Math.min(finiteSeconds(action.currentTime), state.duration),
      };
    case "duration-change": {
      const duration = finiteSeconds(action.duration);
      const segmentDurations = [...state.segmentDurations];
      segmentDurations[state.segmentIndex] = duration;
      return {
        ...state,
        duration,
        segmentDurations,
        currentTime: Math.min(state.currentTime, duration),
      };
    }
    case "seek": {
      const target = locateAbsoluteTime(state, action.absoluteTime);
      return {
        ...state,
        ...target,
        duration: durationAt(state, target.segmentIndex),
        status: state.status === "ended" ? "paused" : state.status,
        error: undefined,
      };
    }
    case "select-segment": {
      const segmentIndex = Math.min(
        Math.max(0, action.segmentIndex),
        Math.max(0, state.segmentIds.length - 1),
      );
      return {
        ...state,
        segmentIndex,
        currentTime: Math.min(finiteSeconds(action.currentTime ?? 0), durationAt(state, segmentIndex)),
        duration: durationAt(state, segmentIndex),
        status: state.status === "ended" ? "paused" : state.status,
        error: undefined,
      };
    }
    case "previous-segment": {
      const segmentIndex = Math.max(0, state.segmentIndex - 1);
      return {
        ...state,
        segmentIndex,
        currentTime: 0,
        duration: durationAt(state, segmentIndex),
        error: undefined,
      };
    }
    case "next-segment": {
      const segmentIndex = Math.min(state.segmentIds.length - 1, state.segmentIndex + 1);
      return {
        ...state,
        segmentIndex: Math.max(0, segmentIndex),
        currentTime: 0,
        duration: durationAt(state, segmentIndex),
        error: undefined,
      };
    }
    case "segment-ended": {
      if (state.segmentIndex < state.segmentIds.length - 1) {
        const segmentIndex = state.segmentIndex + 1;
        return {
          ...state,
          segmentIndex,
          currentTime: 0,
          duration: durationAt(state, segmentIndex),
          status: "loading",
          error: undefined,
        };
      }
      return { ...state, currentTime: state.duration, status: "ended", error: undefined };
    }
    case "set-rate":
      return { ...state, rate: validRate(action.rate) };
    case "set-volume":
      return { ...state, volume: Math.min(1, Math.max(0, action.volume)) };
    case "set-error":
      return { ...state, status: "error", error: action.message };
    case "retry":
      return { ...state, status: "loading", error: undefined };
    case "release":
      return { ...initialPlayerState, rate: state.rate, volume: state.volume };
  }
}
