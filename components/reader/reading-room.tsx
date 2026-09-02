"use client";

import { useState } from "react";
import { AudioPlayer } from "@/components/player/audio-player";
import { ReaderTabs } from "@/components/reader/ReaderTabs";
import { PlayerProvider } from "@/lib/player";
import type { Work } from "@/lib/content/types";
import type { InitialProgress } from "@/lib/player";
import type { AudioManifest } from "@/lib/tts";
import styles from "./reading-room.module.css";

type ReadingRoomProps = {
  work: Work;
  manifest: AudioManifest | null;
  manifests?: AudioManifest[];
  initialProgress?: InitialProgress | null;
};

export function ReadingRoom({ work, manifest, manifests, initialProgress }: ReadingRoomProps) {
  const availableManifests = manifests?.length ? manifests : manifest ? [manifest] : [];
  const [voiceId, setVoiceId] = useState<string | undefined>(
    availableManifests[0]?.voiceId,
  );
  const selectedManifest =
    availableManifests.find((item) => item.voiceId === voiceId) ?? availableManifests[0] ?? null;

  return (
    <PlayerProvider
      key={selectedManifest?.voiceId ?? selectedManifest?.voice ?? "no-audio"}
      initialProgress={initialProgress}
      manifest={selectedManifest}
      segments={work.segments}
      workId={work.id}
    >
      <div className={styles.playerSlot}>
        <AudioPlayer
          manifest={selectedManifest}
          manifests={availableManifests}
          onVoiceChange={setVoiceId}
          work={work}
        />
      </div>
      <ReaderTabs work={work} />
    </PlayerProvider>
  );
}
