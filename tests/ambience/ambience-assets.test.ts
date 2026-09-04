import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { AMBIENCE_SCENES } from "@/lib/ambience/scenes";

const publicRoot = resolve(process.cwd(), "public");

describe("ambience assets", () => {
  it("为每个可选场景提供真实的本地音频文件", () => {
    expect(AMBIENCE_SCENES).toHaveLength(5);

    for (const scene of AMBIENCE_SCENES) {
      expect(scene.url, `${scene.id} must use a local asset`).toMatch(/^\/ambience\/.+\.mp3$/);
      const assetPath = resolve(publicRoot, scene.url!.slice(1));
      expect(existsSync(assetPath), `${scene.id} asset is missing`).toBe(true);
      expect(statSync(assetPath).size, `${scene.id} asset is empty`).toBeGreaterThan(10_000);
    }
  });

  it("场景 URL 唯一，避免切换场景时复用错误音轨", () => {
    const urls = AMBIENCE_SCENES.map((scene) => scene.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
