import matter from "gray-matter";
import { ZodError } from "zod";
import { annotationsSchema, authorSchema, workFrontmatterSchema } from "./schema";
import type {
  Annotation,
  Author,
  ContentMode,
  ContentWarning,
  RightsStatus,
  Work,
} from "./types";

export class ContentValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: string[] = [],
  ) {
    super(message);
    this.name = "ContentValidationError";
  }
}

function validationMessage(error: unknown): string[] {
  if (!(error instanceof ZodError)) return [String(error)];
  return error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`);
}

function normalizeParagraphs(value: string): string[] {
  return value
    .trim()
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.replace(/\s*\n\s*/gu, " ").trim())
    .filter(Boolean);
}

function extractSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>();
  const heading = /^##\s+(.+?)\s*$/gmu;
  const matches = [...markdown.matchAll(heading)];

  matches.forEach((match, index) => {
    const name = match[1]?.trim();
    if (!name || match.index === undefined) return;
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    sections.set(name, markdown.slice(start, end).trim());
  });

  return sections;
}

export function validateRightsStatus(
  status: RightsStatus,
  options: { mode?: ContentMode; sourcePath?: string } = {},
): ContentWarning[] {
  const mode = options.mode ?? "private";
  if (mode === "public" && (status === "unknown" || status === "personal-reference")) {
    throw new ContentValidationError(`版权状态 ${status} 不允许进入公开内容库。`, [
      `rightsStatus: ${status}`,
    ]);
  }

  if (status === "unknown") {
    return [
      {
        code: "rights-status-unknown",
        message: "版权状态为 unknown；公开发布前必须核实。",
        sourcePath: options.sourcePath,
      },
    ];
  }

  return [];
}

export function parseAnnotationsJson(source: string): Annotation[] {
  try {
    return annotationsSchema.parse(JSON.parse(source));
  } catch (error) {
    throw new ContentValidationError("注释 JSON 校验失败。", validationMessage(error));
  }
}

export function parseAuthorJson(source: string): Author {
  try {
    return authorSchema.parse(JSON.parse(source));
  } catch (error) {
    throw new ContentValidationError("作者 JSON 校验失败。", validationMessage(error));
  }
}

export function parseWorkMarkdown(
  source: string,
  options: {
    sourcePath?: string;
    annotations?: Annotation[];
    mode?: ContentMode;
  } = {},
): { work: Work; warnings: ContentWarning[] } {
  const parsed = matter(source);
  let metadata: ReturnType<typeof workFrontmatterSchema.parse>;
  try {
    metadata = workFrontmatterSchema.parse(parsed.data);
  } catch (error) {
    throw new ContentValidationError("作品 Front Matter 校验失败。", validationMessage(error));
  }

  const sections = extractSections(parsed.content);
  const original = normalizeParagraphs(sections.get("原文") ?? "");
  if (original.length === 0) {
    throw new ContentValidationError("作品缺少“原文”内容。", ["sections.原文: required"]);
  }

  const translations = normalizeParagraphs(
    sections.get("白话译文") ?? sections.get("白话") ?? sections.get("现代译文") ?? sections.get("中文译文") ?? "",
  );
  if (translations.length > 0 && translations.length !== original.length) {
    throw new ContentValidationError("“现代译文”段落数必须与“原文”一致。", [
      `sections.现代译文: expected ${original.length}, received ${translations.length}`,
    ]);
  }

  const annotations = options.annotations ?? [];
  const expectedSegmentIds = new Set(original.map((_, index) => `seg-${String(index + 1).padStart(3, "0")}`));
  const invalidAnnotation = annotations.find(
    (annotation) =>
      annotation.workId !== metadata.id ||
      (annotation.segmentId !== undefined && !expectedSegmentIds.has(annotation.segmentId)),
  );
  if (invalidAnnotation) {
    throw new ContentValidationError("注释引用了不匹配的作品或段落。", [invalidAnnotation.id]);
  }

  const warnings = validateRightsStatus(metadata.rightsStatus, {
    mode: options.mode,
    sourcePath: options.sourcePath,
  });

  return {
    work: {
      ...metadata,
      background: sections.get("创作背景")?.trim() ?? "",
      translation:
        sections.get("白话译文")?.trim() ??
        sections.get("白话")?.trim() ??
        sections.get("现代译文")?.trim() ??
        sections.get("中文译文")?.trim() ??
        "",
      appreciation: sections.get("赏析")?.trim() ?? "",
      annotations,
      segments: original.map((displayText, index) => ({
        id: `seg-${String(index + 1).padStart(3, "0")}`,
        order: index,
        displayText,
        speechText: displayText,
        translation: translations[index],
      })),
    },
    warnings,
  };
}
