import type { Segment } from "@/lib/content/types";
import type { AudioManifest } from "@/lib/tts";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export const PLAYBACK_RATES = [0.8, 1, 1.2, 1.5] as const;
export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

export type InitialProgress = {
  segmentId?: string | null;
  positionMs?: number;
  completed?: boolean;
};

export type PlayerState = {
  workId: string | null;
  segmentIds: string[];
  segmentDurations: number[];
  segmentIndex: number;
  status: PlayerStatus;
  currentTime: number;
  duration: number;
  rate: PlaybackRate;
  volume: number;
  error?: string;
};

export type PlayerAction =
  | {
      type: "load-work";
      workId: string;
      segmentIds: string[];
      segmentDurations: number[];
    }
  | { type: "set-status"; status: PlayerStatus }
  | { type: "time-update"; currentTime: number }
  | { type: "duration-change"; duration: number }
  | { type: "seek"; absoluteTime: number }
  | { type: "select-segment"; segmentIndex: number; currentTime?: number }
  | { type: "previous-segment" }
  | { type: "next-segment" }
  | { type: "segment-ended" }
  | { type: "set-rate"; rate: PlaybackRate }
  | { type: "set-volume"; volume: number }
  | { type: "set-error"; message: string }
  | { type: "retry" }
  | { type: "release" };

export type PlayerSource = {
  workId: string;
  manifest?: AudioManifest | null;
  segments: Segment[];
  initialProgress?: InitialProgress | null;
};

export type PlayerContextValue = {
  state: PlayerState;
  manifest?: AudioManifest | null;
  segments: Segment[];
  currentSegmentId: string | null;
  elapsedTime: number;
  totalDuration: number;
  remainingTime: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (absoluteTime: number) => void;
  seekBy: (seconds: number) => void;
  previousSegment: () => void;
  nextSegment: () => void;
  selectSegment: (segmentIndex: number) => void;
  setRate: (rate: PlaybackRate) => void;
  setVolume: (volume: number) => void;
  retry: () => void;
};
