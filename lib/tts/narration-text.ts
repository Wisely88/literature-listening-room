import type { Segment, Work } from "@/lib/content/types";

const FOREIGN_LITERATURE_CATEGORY = "外国文学";

const AUDIO_ONLY_ALIASES: Readonly<Record<string, string>> = {
  "解衣": "姐衣",
  "为乐": "围乐",
  "将进酒": "枪进酒",
  "扁舟": "篇舟",
  "有奇": "有机",
  "属客": "嘱客",
  "冯虚御风": "凭虚御风",
  "相缪": "相辽",
};

export type NarrationWork = Pick<Work, "category" | "pronunciationOverrides">;

function stripMixedLanguageArtifacts(text: string): string {
  return text
    .replace(/（[^（）]*[A-Za-z][^（）]*）/gu, "")
    .replace(/\([^()]*[A-Za-z][^()]*\)/gu, "")
    .replace(/\b[A-Za-z][A-Za-z'’.-]*\b/gu, "")
    .replace(/\s+([，。！？；：])/gu, "$1")
    .replace(/([（【])\s+/gu, "$1")
    .replace(/\s+([）】])/gu, "$1");
}

function applyAudioOnlyAliases(text: string, work: NarrationWork): string {
  let result = text;
  for (const override of work.pronunciationOverrides) {
    const alias = AUDIO_ONLY_ALIASES[override.term];
    if (alias) result = result.split(override.term).join(alias);
  }
  return result;
}

export function normalizeNarrationText(text: string, stripLatin = false): string {
  const withoutFormatting = text
    .replace(/\[\[slnc\s+\d+\]\]/gu, "")
    .replace(/[*_]/gu, "")
    .replace(/[ \t]+/gu, " ")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
  const normalized = stripLatin
    ? stripMixedLanguageArtifacts(withoutFormatting)
    : withoutFormatting;
  return normalized
    .replace(/\s{2,}/gu, " ")
    .replace(/\s+\n/gu, "\n")
    .trim();
}

export function narrationTextForSegment(work: NarrationWork, segment: Segment): string {
  const isForeignLiterature = work.category === FOREIGN_LITERATURE_CATEGORY;
  const source = isForeignLiterature
    ? segment.translation?.trim()
    : (segment.speechText ?? segment.displayText).trim();

  if (!source) {
    throw new Error(
      "段落 " + segment.id + (isForeignLiterature ? " 缺少中文译文。" : " 缺少朗读文本。"),
    );
  }

  return applyAudioOnlyAliases(
    normalizeNarrationText(source, isForeignLiterature),
    work,
  );
}

export function narrationTextForWork(work: NarrationWork & Pick<Work, "segments">): string {
  return work.segments
    .map((segment) => narrationTextForSegment(work, segment))
    .join("\n\n");
}
