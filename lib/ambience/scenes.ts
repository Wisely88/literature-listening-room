export type AmbienceSceneId = "rain" | "ocean" | "fire" | "night" | "wind";

export type AmbienceScene = {
  id: AmbienceSceneId;
  label: string;
  url: string | null;
};

export const AMBIENCE_SCENES: AmbienceScene[] = [
  { id: "rain", label: "雨声", url: "/ambience/rain-soft.mp3" },
  { id: "ocean", label: "海浪", url: "/ambience/ocean-night.mp3" },
  { id: "fire", label: "篝火", url: "/ambience/fireplace.mp3" },
  { id: "night", label: "夜虫", url: "/ambience/insects-night.mp3" },
  { id: "wind", label: "风声", url: "/ambience/wind-soft.mp3" },
];

export function ambienceSceneById(id: string | null | undefined): AmbienceScene | null {
  if (!id) return null;
  return AMBIENCE_SCENES.find((scene) => scene.id === id) ?? null;
}

export function isAmbienceSceneId(value: string | null): value is AmbienceSceneId {
  return AMBIENCE_SCENES.some((scene) => scene.id === value);
}
