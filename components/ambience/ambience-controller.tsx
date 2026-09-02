"use client";

import { useEffect, useRef, useState } from "react";
import {
  AMBIENCE_SCENES,
  ambienceSceneById,
  isAmbienceSceneId,
  type AmbienceSceneId,
} from "@/lib/ambience/scenes";
import styles from "./ambience-controller.module.css";

const STORAGE_SCENE = "literature-ambience-scene";
const STORAGE_VOLUME = "literature-ambience-volume";
const DEFAULT_VOLUME = 0.22;
const FADE_MS = 650;

function fadeVolume(
  audio: HTMLAudioElement,
  target: number,
  durationMs: number,
): void {
  const start = audio.volume;
  const startTime = performance.now();

  function step(now: number) {
    const progress = Math.min(1, (now - startTime) / durationMs);
    audio.volume = start + (target - start) * progress;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

type AmbienceControllerProps = {
  defaultScene?: string | null;
};

export function AmbienceController({ defaultScene }: AmbienceControllerProps) {
  const initialScene = typeof window === "undefined"
    ? (ambienceSceneById(defaultScene)?.id ?? "rain")
    : resolveStoredScene(defaultScene);
  const [scene, setScene] = useState<AmbienceSceneId>(initialScene);
  const [enabled, setEnabled] = useState(false);
  const [volume, setVolume] = useState(
    () => (typeof window === "undefined" ? DEFAULT_VOLUME : resolveStoredVolume()),
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof Audio === "undefined") return;
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.removeAttribute("src");
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_VOLUME, String(volume));
    }
  }, [volume]);

  function toggle() {
    const audio = audioRef.current;
    const definition = ambienceSceneById(scene);

    if (enabled) {
      setEnabled(false);
      if (audio) {
        fadeVolume(audio, 0, FADE_MS);
        window.setTimeout(() => audio.pause(), FADE_MS);
      }
      return;
    }

    setEnabled(true);
    if (audio && definition?.url) {
      audio.src = definition.url;
      audio.volume = 0;
      void audio.play().then(() => fadeVolume(audio, volume, FADE_MS)).catch(() => {
        setEnabled(false);
      });
    }
  }

  function selectScene(next: AmbienceSceneId) {
    setScene(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_SCENE, next);
    }
    const audio = audioRef.current;
    const definition = ambienceSceneById(next);
    if (enabled && audio && definition?.url) {
      audio.pause();
      audio.src = definition.url;
      audio.volume = 0;
      void audio.play().then(() => fadeVolume(audio, volume, FADE_MS)).catch(() => {
        setEnabled(false);
      });
    }
  }

  const availableScenes = AMBIENCE_SCENES;
  const selectedScene = ambienceSceneById(scene);

  return (
    <section aria-label="环境音" className={styles.controller}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>环境音</p>
          <h2>{selectedScene?.label ?? "环境音"}</h2>
        </div>
        <button
          aria-pressed={enabled}
          className={styles.toggle}
          onClick={toggle}
          type="button"
        >
          {enabled ? "关闭" : "开启"}
        </button>
      </div>

      <div className={styles.scenes} role="group" aria-label="环境音场景">
        {availableScenes.map((item) => (
          <button
            aria-pressed={scene === item.id}
            className={scene === item.id ? styles.sceneActive : styles.scene}
            key={item.id}
            onClick={() => selectScene(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <label className={styles.volume}>
        <span>{selectedScene?.label ?? "环境音"}音量</span>
        <input
          aria-label={(selectedScene?.label ?? "环境音") + "音量"}
          max="0.5"
          min="0"
          onChange={(event) => setVolume(Number(event.currentTarget.value))}
          step="0.01"
          type="range"
          value={volume}
        />
      </label>
    </section>
  );
}

function resolveStoredScene(defaultScene: string | null | undefined): AmbienceSceneId {
  const stored = window.localStorage.getItem(STORAGE_SCENE);
  if (isAmbienceSceneId(stored)) return stored;
  return ambienceSceneById(defaultScene)?.id ?? "rain";
}

function resolveStoredVolume(): number {
  const raw = window.localStorage.getItem(STORAGE_VOLUME);
  if (raw === null) return DEFAULT_VOLUME;
  const stored = Number(raw);
  if (Number.isFinite(stored) && stored >= 0 && stored <= 0.5) return stored;
  return DEFAULT_VOLUME;
}
