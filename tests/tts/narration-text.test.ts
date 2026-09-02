import { describe, expect, it } from "vitest";
import {
  narrationTextForSegment,
  narrationTextForWork,
  normalizeNarrationText,
} from "@/lib/tts/narration-text";

describe("narration text", () => {
  it("uses reviewed Chinese translation for foreign literature and removes Latin inserts", () => {
    const text = narrationTextForSegment(
      { category: "外国文学", pronunciationOverrides: [] },
      {
        id: "seg-001",
        order: 0,
        displayText: "English original",
        speechText: "English original",
        translation: "早餐是一碗马马利加玉米粥（mamaliga），味道温暖。",
      },
    );

    expect(text).toBe("早餐是一碗马马利加玉米粥，味道温暖。");
    expect(text).not.toMatch(/[A-Za-z]/u);
  });

  it("uses audio-only aliases for known polyphonic classical terms", () => {
    const text = narrationTextForSegment(
      {
        category: "古文",
        pronunciationOverrides: [
          { term: "解衣", pronunciation: "jiě yī" },
          { term: "为乐", pronunciation: "wéi lè" },
        ],
      },
      {
        id: "seg-001",
        order: 0,
        displayText: "解衣欲睡，念无与为乐者。",
        speechText: "解衣欲睡，念无与为乐者。",
      },
    );

    expect(text).toBe("姐衣欲睡，念无与围乐者。");
  });

  it("removes legacy local pause markers and joins work segments", () => {
    const work = {
      category: "散文",
      pronunciationOverrides: [],
      segments: [
        { id: "seg-001", order: 0, displayText: "第一段。", speechText: "第一段。[[slnc 380]]" },
        { id: "seg-002", order: 1, displayText: "第二段。", speechText: "第二段。" },
      ],
    };

    expect(narrationTextForWork(work)).toBe("第一段。\n\n第二段。");
    expect(normalizeNarrationText("正文。[[slnc 380]]")).toBe("正文。");
  });
});
