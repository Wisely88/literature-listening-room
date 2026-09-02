import { describe, expect, it } from "vitest";
import { buildEdgeTtsArgs } from "@/lib/tts/server/edge-neural-tts-provider";
import { parseEdgeAudioArgs } from "@/scripts/generate-edge-audio";

describe("Edge neural audio generation", () => {
  it("builds safe CLI arguments without a shell", () => {
    expect(
      buildEdgeTtsArgs(
        "/tmp/input text.txt",
        "/tmp/output audio.mp3",
        "zh-CN-XiaoxiaoNeural",
        "-12%",
        "-2Hz",
      ),
    ).toEqual([
      "--voice",
      "zh-CN-XiaoxiaoNeural",
      "--rate=-12%",
      "--pitch=-2Hz",
      "--file",
      "/tmp/input text.txt",
      "--write-media",
      "/tmp/output audio.mp3",
    ]);
  });

  it("parses the literary narration defaults", () => {
    const options = parseEdgeAudioArgs([], "/project");
    expect(options).toMatchObject({
      slug: "ji-cheng-tian-si-ye-you",
      voice: "zh-CN-XiaoxiaoNeural",
      rate: "-12%",
      pitch: "-2Hz",
      force: false,
    });
  });

  it("parses a named voice variant", () => {
    expect(parseEdgeAudioArgs(["--voice-id", "story-male"], "/project")).toMatchObject({
      voiceId: "story-male",
    });
  });

  it("rejects non-Chinese or non-neural voices", () => {
    expect(() =>
      parseEdgeAudioArgs(["--voice", "en-US-JennyNeural"], "/project"),
    ).toThrow(/zh-CN/u);
  });
});
