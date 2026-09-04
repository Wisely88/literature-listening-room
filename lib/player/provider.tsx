"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { getElapsedTime, getTotalDuration, initialPlayerState, playerReducer } from "./reducer";
import type { PlaybackRate, PlayerContextValue, PlayerSource, PlayerState } from "./types";

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

function errorMessage(): string {
  return "音频暂时无法加载";
}

function persistProgress(state: PlayerState) {
  if (!state.workId || state.segmentIds.length === 0) return;

  void fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workId: state.workId,
      segmentId: state.segmentIds[state.segmentIndex] ?? undefined,
      positionMs: Math.round(state.currentTime * 1000),
      completed: state.status === "ended",
    }),
    keepalive: true,
  }).catch(() => {
    // Progress persistence is best-effort; playback must not fail on it.
  });
}

function initialStateFor(source: PlayerSource): PlayerState {
  const segmentIds = source.manifest?.segments.map((segment) => segment.id) ?? [];
  const segmentDurations =
    source.manifest?.segments.map((segment) => (segment.durationMs ?? 0) / 1000) ?? [];
  let state = playerReducer(initialPlayerState, {
    type: "load-work",
    workId: source.workId,
    segmentIds,
    segmentDurations,
  });

  const initial = source.initialProgress;
  if (initial?.segmentId) {
    const segmentIndex = segmentIds.indexOf(initial.segmentId);
    if (segmentIndex >= 0) {
      state = playerReducer(state, {
        type: "select-segment",
        segmentIndex,
        currentTime: (initial.positionMs ?? 0) / 1000,
      });
    }
  }

  return state;
}

export function PlayerProvider({
  workId,
  manifest,
  segments,
  initialProgress,
  children,
}: PlayerSource & { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    playerReducer,
    { workId, manifest, segments, initialProgress },
    initialStateFor,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const stateRef = useRef<PlayerState>(state);
  const shouldPlayRef = useRef(false);
  const pendingTimeRef = useRef(0);
  const didInitRef = useRef(false);

  stateRef.current = state;

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      return;
    }

    const segmentIds = manifest?.segments.map((segment) => segment.id) ?? [];
    const durations = manifest?.segments.map((segment) => (segment.durationMs ?? 0) / 1000) ?? [];
    dispatch({ type: "load-work", workId, segmentIds, segmentDurations: durations });
    shouldPlayRef.current = false;
    pendingTimeRef.current = 0;

    return () => {
      shouldPlayRef.current = false;
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      preloadRef.current = null;
    };
  }, [manifest, workId]);

  useEffect(() => {
    if (!manifest?.segments.length || typeof Audio === "undefined") return;

    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const playWhenReady = () => {
      if (!shouldPlayRef.current) return;
      void audio.play().catch(() => {
        shouldPlayRef.current = false;
        dispatch({ type: "set-error", message: errorMessage() });
      });
    };
    const handleLoaded = () => {
      const fallbackDuration = stateRef.current.duration;
      const duration = Number.isFinite(audio.duration) ? audio.duration : fallbackDuration;
      dispatch({ type: "duration-change", duration });
      if (pendingTimeRef.current > 0) {
        audio.currentTime = Math.min(pendingTimeRef.current, duration);
        pendingTimeRef.current = 0;
      }
      playWhenReady();
    };
    const handleTime = () => dispatch({ type: "time-update", currentTime: audio.currentTime });
    const handlePlay = () => dispatch({ type: "set-status", status: "playing" });
    const handlePause = () => {
      if (stateRef.current.status === "playing" && !shouldPlayRef.current) {
        dispatch({ type: "set-status", status: "paused" });
      }
    };
    const handleWaiting = () => dispatch({ type: "set-status", status: "loading" });
    const handleEnded = () => {
      if (stateRef.current.segmentIndex < manifest.segments.length - 1) {
        shouldPlayRef.current = true;
      } else {
        shouldPlayRef.current = false;
      }
      dispatch({ type: "segment-ended" });
    };
    const handleError = () => {
      shouldPlayRef.current = false;
      dispatch({ type: "set-error", message: errorMessage() });
    };

    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("canplay", playWhenReady);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      shouldPlayRef.current = false;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, [manifest]);

  useEffect(() => {
    const audio = audioRef.current;
    const source = manifest?.segments[state.segmentIndex];
    if (!audio || !source) return;

    audio.pause();
    audio.src = source.url;
    if (pendingTimeRef.current > 0 && audio.readyState >= 1) {
      audio.currentTime = pendingTimeRef.current;
      pendingTimeRef.current = 0;
    }

    const nextSource = manifest?.segments[state.segmentIndex + 1];
    if (nextSource && typeof Audio !== "undefined") {
      const preload = new Audio();
      preload.preload = "auto";
      preload.src = nextSource.url;
      preloadRef.current = preload;
    } else {
      preloadRef.current = null;
    }

    if (shouldPlayRef.current) {
      dispatch({ type: "set-status", status: "loading" });
      void audio.play().catch(() => {
        // A metadata/canplay event retries once the new segment is ready.
      });
    }
  }, [manifest, state.segmentIndex]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = state.rate;
  }, [state.rate]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = state.volume;
  }, [state.volume]);

  useEffect(() => {
    if (state.status === "paused" || state.status === "ended") {
      persistProgress(stateRef.current);
    }
  }, [state.segmentIndex, state.status]);

  useEffect(() => {
    return () => persistProgress(stateRef.current);
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !manifest?.segments.length) return;
    shouldPlayRef.current = true;
    if (stateRef.current.status === "ended") {
      pendingTimeRef.current = 0;
      audio.currentTime = 0;
      dispatch({ type: "select-segment", segmentIndex: 0 });
    }
    dispatch({ type: "set-status", status: "loading" });
    void audio.play().catch(() => {
      if (audio.readyState >= 2) {
        shouldPlayRef.current = false;
        dispatch({ type: "set-error", message: errorMessage() });
      }
    });
  }, [manifest]);

  const pause = useCallback(() => {
    shouldPlayRef.current = false;
    audioRef.current?.pause();
    dispatch({ type: "set-status", status: "paused" });
  }, []);

  const seekTo = useCallback((absoluteTime: number) => {
    const before = stateRef.current;
    const completedBefore = before.segmentDurations
      .slice(0, before.segmentIndex)
      .reduce((total, duration) => total + duration, 0);
    dispatch({ type: "seek", absoluteTime });

    let remaining = Math.max(0, absoluteTime);
    let targetIndex = 0;
    for (; targetIndex < before.segmentDurations.length - 1; targetIndex += 1) {
      if (remaining < before.segmentDurations[targetIndex]!) break;
      remaining -= before.segmentDurations[targetIndex]!;
    }
    if (targetIndex === before.segmentIndex && audioRef.current) {
      audioRef.current.currentTime = remaining;
    } else {
      pendingTimeRef.current = remaining;
    }
    if (absoluteTime < completedBefore) pendingTimeRef.current = remaining;
  }, []);

  const selectSegment = useCallback((segmentIndex: number) => {
    pendingTimeRef.current = 0;
    dispatch({ type: "select-segment", segmentIndex });
  }, []);

  const value = useMemo<PlayerContextValue>(() => {
    const elapsedTime = getElapsedTime(state);
    const totalDuration = getTotalDuration(state);
    return {
      state,
      manifest,
      segments,
      currentSegmentId: state.segmentIds[state.segmentIndex] ?? null,
      elapsedTime,
      totalDuration,
      remainingTime: Math.max(0, totalDuration - elapsedTime),
      play,
      pause,
      // Loading still means the user requested playback. Follow media intent
      // so pause also works while metadata loads or the network buffers.
      toggle: shouldPlayRef.current ? pause : play,
      seekTo,
      seekBy: (seconds) => seekTo(elapsedTime + seconds),
      previousSegment: () => {
        pendingTimeRef.current = 0;
        dispatch({ type: "previous-segment" });
      },
      nextSegment: () => {
        pendingTimeRef.current = 0;
        dispatch({ type: "next-segment" });
      },
      selectSegment,
      setRate: (rate: PlaybackRate) => dispatch({ type: "set-rate", rate }),
      setVolume: (volume) => dispatch({ type: "set-volume", volume }),
      retry: () => {
        dispatch({ type: "retry" });
        const audio = audioRef.current;
        if (!audio) return;
        audio.load();
        if (shouldPlayRef.current) void audio.play();
      },
    };
  }, [manifest, pause, play, seekTo, segments, selectSegment, state]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function useOptionalPlayer(): PlayerContextValue | undefined {
  return useContext(PlayerContext);
}

export function usePlayer(): PlayerContextValue {
  const value = useOptionalPlayer();
  if (!value) throw new Error("usePlayer 必须在 PlayerProvider 内使用");
  return value;
}
