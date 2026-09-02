"use client";

import { useEffect, useRef, useState } from "react";
import type { Work } from "@/lib/content/types";
import { narrationTextForWork } from "@/lib/tts/narration-text";
import {
  PLAYBACK_RATES,
  PlayerProvider,
  useOptionalPlayer,
  usePlayer,
  type PlaybackRate,
} from "@/lib/player";
import { BrowserSpeechFallback, type AudioManifest } from "@/lib/tts";
import styles from "./audio-player.module.css";

type AudioPlayerProps = {
  work: Work;
  manifest?: AudioManifest | null;
  manifests?: AudioManifest[];
  onVoiceChange?: (voiceId: string | undefined) => void;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const rounded = Math.floor(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

function FormalAudioPlayer({ title, voices, selectedVoiceId, onVoiceChange }: { title: string; voices: AudioManifest[]; selectedVoiceId?: string; onVoiceChange?: (voiceId: string | undefined) => void }) {
  const player = usePlayer();
  const { state } = player;
  const isPlaying = state.status === "playing" || state.status === "loading";
  const atFirstSegment = state.segmentIndex === 0;
  const atLastSegment = state.segmentIndex >= state.segmentIds.length - 1;

  return (
    <section aria-label={`${title}自然朗读播放器`} className={styles.player}>
      <div className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>自然朗读</p>
          <h2>{title}</h2>
        </div>
        <p aria-live="polite" className={styles.segmentStatus}>
          第 {state.segmentIndex + 1} / {state.segmentIds.length} 段
        </p>
      </div>

      {state.status === "error" ? (
        <div className={styles.error} role="alert">
          <p>{state.error ?? "音频暂时无法加载"}</p>
          <button onClick={player.retry} type="button">重新尝试</button>
        </div>
      ) : null}

      <div className={styles.timeline}>
        <label className="sr-only" htmlFor="reading-progress">播放进度</label>
        <input
          aria-valuetext={`已播放 ${formatTime(player.elapsedTime)}`}
          disabled={player.totalDuration <= 0}
          id="reading-progress"
          max={Math.max(1, player.totalDuration)}
          min="0"
          onChange={(event) => player.seekTo(Number(event.currentTarget.value))}
          step="0.1"
          type="range"
          value={Math.min(player.elapsedTime, Math.max(1, player.totalDuration))}
        />
        <div className={styles.timeRow}>
          <span>{formatTime(player.elapsedTime)}</span>
          <span>剩余 {formatTime(player.remainingTime)}</span>
        </div>
      </div>

      <div aria-label="播放控制" className={styles.controls} role="group">
        <button
          aria-label="上一段"
          disabled={atFirstSegment}
          onClick={player.previousSegment}
          type="button"
        >
          <span aria-hidden="true">|‹</span>
        </button>
        <button aria-label="后退15秒" onClick={() => player.seekBy(-15)} type="button">
          <span aria-hidden="true">−15</span>
        </button>
        <button
          aria-label={isPlaying ? "暂停" : "播放"}
          aria-pressed={isPlaying}
          className={styles.primaryControl}
          onClick={player.toggle}
          type="button"
        >
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "▶"}</span>
        </button>
        <button aria-label="前进15秒" onClick={() => player.seekBy(15)} type="button">
          <span aria-hidden="true">+15</span>
        </button>
        <button
          aria-label="下一段"
          disabled={atLastSegment}
          onClick={player.nextSegment}
          type="button"
        >
          <span aria-hidden="true">›|</span>
        </button>
      </div>

      <div className={styles.settings}>
        {voices.length > 1 ? (
          <label>
            <span>朗读音色</span>
            <select
              aria-label="朗读音色"
              onChange={(event) => onVoiceChange?.(event.currentTarget.value || undefined)}
              value={selectedVoiceId ?? ""}
            >
              {voices.map((voice) => (
                <option key={voice.voiceId ?? voice.voice} value={voice.voiceId ?? ""}>
                  {voice.voiceId === "story-male" ? "沉稳男声" : voice.voiceId === "young-voice" ? "少年声" : "温暖女声"}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          <span>倍速</span>
          <select
            aria-label="播放倍速"
            onChange={(event) => player.setRate(Number(event.currentTarget.value) as PlaybackRate)}
            value={state.rate}
          >
            {PLAYBACK_RATES.map((rate) => (
              <option key={rate} value={rate}>{rate.toFixed(1)}×</option>
            ))}
          </select>
        </label>
        <label className={styles.volume}>
          <span>音量</span>
          <input
            aria-label="朗读音量"
            max="1"
            min="0"
            onChange={(event) => player.setVolume(Number(event.currentTarget.value))}
            step="0.05"
            type="range"
            value={state.volume}
          />
        </label>
      </div>
    </section>
  );
}

function MissingAudio({ work }: { work: Work }) {
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    return new BrowserSpeechFallback().isSupported();
  });
  const fallbackRef = useRef<BrowserSpeechFallback | null>(null);
  const [status, setStatus] = useState<"idle" | "playing" | "paused" | "error">("idle");

  useEffect(() => {
    const fallback = new BrowserSpeechFallback();
    fallbackRef.current = fallback;
    return () => {
      fallback.cancel();
    };
  }, []);

  const text = narrationTextForWork(work);

  function startFallback() {
    const started = fallbackRef.current?.speak(text, {
      onStart: () => setStatus("playing"),
      onEnd: () => setStatus("idle"),
      onError: () => setStatus("error"),
    });
    if (!started) setStatus("error");
  }

  function toggleFallback() {
    const fallback = fallbackRef.current;
    if (!fallback) return;
    if (status === "playing" && fallback.pause()) {
      setStatus("paused");
      return;
    }
    if (status === "paused" && fallback.resume()) {
      setStatus("playing");
      return;
    }
    startFallback();
  }

  return (
    <section aria-label={`${work.title}朗读`} className={`${styles.player} ${styles.empty}`}>
      <p className={styles.eyebrow}>自然朗读</p>
      <h2>本篇还没有生成自然朗读</h2>
      <p>你仍可阅读完整原文；系统朗读仅作为临时 fallback，音色由当前设备决定。</p>
      {supported ? (
        <button className={styles.fallbackButton} onClick={toggleFallback} type="button">
          {status === "playing" ? "暂停系统朗读" : status === "paused" ? "继续系统朗读" : "使用系统朗读"}
        </button>
      ) : (
        <p className={styles.unavailable}>当前浏览器不支持系统朗读。</p>
      )}
      {status === "error" ? <p className={styles.fallbackError} role="alert">系统朗读未能启动，请稍后重试。</p> : null}
    </section>
  );
}

function AudioPlayerContent({ work, manifest, manifests, onVoiceChange }: AudioPlayerProps) {
  if (!manifest?.segments.length) return <MissingAudio work={work} />;
  return <FormalAudioPlayer title={work.title} voices={manifests ?? (manifest ? [manifest] : [])} selectedVoiceId={manifest?.voiceId} onVoiceChange={onVoiceChange} />;
}

export function AudioPlayer(props: AudioPlayerProps) {
  const existingPlayer = useOptionalPlayer();
  if (existingPlayer) return <AudioPlayerContent {...props} />;

  return (
    <PlayerProvider manifest={props.manifest} segments={props.work.segments} workId={props.work.id}>
      <AudioPlayerContent {...props} />
    </PlayerProvider>
  );
}
