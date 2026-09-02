import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { ReadingRoom } from "@/components/reader/reading-room";
import type { Work } from "@/lib/content/types";
import type { AudioManifest } from "@/lib/tts";

const work: Work = {
  id: "sample-work",
  slug: "sample-work",
  title: "示例作品",
  aliases: [],
  authorId: "author-1",
  category: "古文",
  language: "zh-CN",
  rightsStatus: "public-domain",
  summary: "示例。",
  tags: [],
  moods: [],
  ambience: [],
  editorialNotes: [],
  pronunciationOverrides: [],
  background: "",
  translation: "",
  appreciation: "",
  annotations: [],
  segments: [
    { id: "seg-001", order: 0, displayText: "第一段。", speechText: "第一段。" },
    { id: "seg-002", order: 1, displayText: "第二段。", speechText: "第二段。" },
    { id: "seg-003", order: 2, displayText: "第三段。", speechText: "第三段。" },
  ],
};

const manifest: AudioManifest = {
  version: 1,
  workId: "sample-work",
  provider: "local-pregenerated",
  voice: "test-voice",
  format: "mp3",
  segments: [
    { id: "seg-001", url: "/audio/sample-work/seg-001.mp3", durationMs: 3000 },
    { id: "seg-002", url: "/audio/sample-work/seg-002.mp3", durationMs: 3000 },
    { id: "seg-003", url: "/audio/sample-work/seg-003.mp3", durationMs: 3000 },
  ],
};

beforeAll(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
});

describe("ReadingRoom 同步高亮", () => {
  it("初始高亮第一段，点击第三段后跳转并高亮", async () => {
    const user = userEvent.setup();
    render(<ReadingRoom manifest={manifest} work={work} />);

    expect(screen.getByText("第一段。")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("第二段。")).not.toHaveAttribute("aria-current");

    await user.click(screen.getByText("第三段。"));

    expect(screen.getByText("第三段。")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("第一段。")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("第 3 / 3 段")).toBeVisible();
  });

  it("从 initialProgress 恢复段落高亮", () => {
    render(
      <ReadingRoom
        initialProgress={{ segmentId: "seg-002", positionMs: 1000 }}
        manifest={manifest}
        work={work}
      />,
    );

    expect(screen.getByText("第二段。")).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("第 2 / 3 段")).toBeVisible();
  });
});
