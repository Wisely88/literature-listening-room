import "server-only";

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { parseAudioManifest } from "../manifest";
import type { AudioManifest } from "../types";

const workIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type AudioManifestLoaderOptions = {
  storageRoot?: string;
};

export async function loadAudioManifest(
  workId: string,
  options: AudioManifestLoaderOptions = {},
): Promise<AudioManifest> {
  if (!workIdPattern.test(workId)) {
    throw new Error("Invalid audio manifest workId");
  }

  const storageRoot = path.resolve(
    /* turbopackIgnore: true */
    options.storageRoot ?? path.join(process.cwd(), "public", "audio"),
  );
  const manifestPath = path.resolve(storageRoot, workId, "manifest.json");
  const relativePath = path.relative(storageRoot, manifestPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Audio manifest path escapes storage root");
  }

  const raw = await readFile(manifestPath, "utf8");
  const manifest = parseAudioManifest(JSON.parse(raw) as unknown);

  if (manifest.workId !== workId) {
    throw new Error(`Audio manifest workId mismatch: expected ${workId}, received ${manifest.workId}`);
  }

  return manifest;
}


export async function loadAudioManifests(
  workId: string,
  options: AudioManifestLoaderOptions = {},
): Promise<AudioManifest[]> {
  const manifests: AudioManifest[] = [];
  try {
    manifests.push(await loadAudioManifest(workId, options));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const storageRoot = path.resolve(options.storageRoot ?? path.join(process.cwd(), "public", "audio"));
  const workDirectory = path.resolve(storageRoot, workId);
  const relativeDirectory = path.relative(storageRoot, workDirectory);
  if (relativeDirectory.startsWith("..") || path.isAbsolute(relativeDirectory)) {
    throw new Error("Audio manifest path escapes storage root");
  }

  let entries: string[];
  try {
    entries = await readdir(workDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return manifests;
    throw error;
  }

  for (const entry of entries.filter((name) => /^manifest-[a-z0-9]+(?:-[a-z0-9]+)*\.json$/u.test(name))) {
    const raw = await readFile(path.join(workDirectory, entry), "utf8");
    const manifest = parseAudioManifest(JSON.parse(raw) as unknown);
    if (manifest.workId === workId) manifests.push(manifest);
  }
  return manifests;
}
