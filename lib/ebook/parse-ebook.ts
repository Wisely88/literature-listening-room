import JSZip from "jszip";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_TEXT_LENGTH = 1_500_000;

export type ParsedEbook = {
  title: string;
  author: string;
  text: string;
  format: "epub" | "txt" | "md";
  characterCount: number;
};

async function fileArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") return fileArrayBuffer(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error("文件读取失败。"));
    reader.readAsArrayBuffer(file);
  });
}

function cleanText(value: string): string {
  const paragraphs = value
    .replace(/\r\n?/gu, "\n")
    .replace(/\u00a0/gu, " ")
    .split(/\n\s*\n/gu)
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => line.replace(/[ \t]+/gu, " ").trim())
        .filter(Boolean)
        .join(" "),
    )
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.join("\n\n").slice(0, MAX_TEXT_LENGTH).trim();
}

function markdownToPlainText(source: string): string {
  return cleanText(
    source
      .replace(/^---\s*\n[\s\S]*?\n---\s*\n?/u, "")
      .replace(/^#{1,6}\s+/gmu, "")
      .replace(/^\s*[-*+]\s+/gmu, "")
      .replace(/^\s*\d+[.)]\s+/gmu, "")
      .replace(/!\[([^\]]*)\]\([^)]*\)/gu, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
      .replace(/[*_~]{1,3}/gu, ""),
  );
}

function decodePlainText(bytes: ArrayBuffer): string {
  const utf8 = new TextDecoder("utf-8").decode(bytes);
  const replacementCount = [...utf8].filter((character) => character === "�").length;
  if (replacementCount <= Math.max(2, utf8.length * 0.005)) return utf8;

  try {
    return new TextDecoder("gb18030").decode(bytes);
  } catch {
    return utf8;
  }
}

function xmlDocument(source: string, label: string): Document {
  const document = new DOMParser().parseFromString(source, "application/xml");
  if (document.querySelector("parsererror")) {
    throw new Error(label + " 结构无法解析。");
  }
  return document;
}

function xmlText(document: Document, localName: string): string {
  const element = [...document.getElementsByTagName("*")].find(
    (candidate) => candidate.localName === localName,
  );
  return element?.textContent?.trim() ?? "";
}

function resolveZipPath(baseFile: string, relativePath: string): string {
  const baseParts = baseFile.split("/").slice(0, -1);
  const rawParts = decodeURIComponent(relativePath.split("#")[0] ?? "").split("/");
  const result = [...baseParts];

  for (const part of rawParts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      result.pop();
    } else {
      result.push(part);
    }
  }

  return result.join("/");
}

function htmlToParagraphs(source: string): string[] {
  const document = new DOMParser().parseFromString(source, "text/html");
  document.querySelectorAll("script, style, nav, svg").forEach((element) => element.remove());
  const blocks = [
    ...document.body.querySelectorAll("h1, h2, h3, h4, p, blockquote, li"),
  ]
    .map((element) => cleanText(element.textContent ?? ""))
    .filter((text) => text.length > 0);

  if (blocks.length) return blocks;
  const fallback = cleanText(document.body.textContent ?? "");
  return fallback ? [fallback] : [];
}

async function parseEpub(file: File): Promise<ParsedEbook> {
  const zip = await JSZip.loadAsync(await fileArrayBuffer(file));
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) throw new Error("EPUB 缺少 META-INF/container.xml。");

  const container = xmlDocument(await containerFile.async("text"), "EPUB container");
  const rootfile = [...container.getElementsByTagName("*")].find(
    (element) => element.localName === "rootfile",
  );
  const packagePath = rootfile?.getAttribute("full-path");
  if (!packagePath) throw new Error("EPUB 没有声明内容清单。");

  const packageFile = zip.file(packagePath);
  if (!packageFile) throw new Error("EPUB 内容清单不存在。");
  const packageDocument = xmlDocument(await packageFile.async("text"), "EPUB package");

  const manifest = new Map<string, { href: string; mediaType: string }>();
  for (const item of [...packageDocument.getElementsByTagName("*")]) {
    if (item.localName !== "item") continue;
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    if (!id || !href) continue;
    manifest.set(id, {
      href,
      mediaType: item.getAttribute("media-type") ?? "",
    });
  }

  const spineIds = [...packageDocument.getElementsByTagName("*")]
    .filter((element) => element.localName === "itemref")
    .map((element) => element.getAttribute("idref"))
    .filter((value): value is string => Boolean(value));

  const readingOrder = spineIds.length
    ? spineIds.flatMap((id) => (manifest.has(id) ? [manifest.get(id)!] : []))
    : [...manifest.values()].filter((item) =>
        /(?:xhtml|html)/u.test(item.mediaType),
      );

  const paragraphs: string[] = [];
  for (const item of readingOrder) {
    const contentPath = resolveZipPath(packagePath, item.href);
    const contentFile = zip.file(contentPath);
    if (!contentFile) continue;
    paragraphs.push(...htmlToParagraphs(await contentFile.async("text")));
    if (paragraphs.join("\n\n").length >= MAX_TEXT_LENGTH) break;
  }

  const text = cleanText(paragraphs.join("\n\n"));
  if (!text) throw new Error("EPUB 中没有找到可阅读正文。");

  return {
    title: xmlText(packageDocument, "title") || file.name.replace(/\.epub$/iu, ""),
    author: xmlText(packageDocument, "creator"),
    text,
    format: "epub",
    characterCount: text.length,
  };
}

export async function parseEbookFile(file: File): Promise<ParsedEbook> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("电子书不能超过 20 MB。");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "epub") return parseEpub(file);
  if (extension !== "txt" && extension !== "md" && extension !== "markdown") {
    throw new Error("目前支持 EPUB、TXT 和 Markdown 文件。");
  }

  const decoded = decodePlainText(await fileArrayBuffer(file));
  const text = extension === "txt" ? cleanText(decoded) : markdownToPlainText(decoded);
  if (!text) throw new Error("文件中没有找到可阅读正文。");

  return {
    title: file.name.replace(/\.(?:txt|md|markdown)$/iu, ""),
    author: "",
    text,
    format: extension === "txt" ? "txt" : "md",
    characterCount: text.length,
  };
}

export function ebookTextToParagraphs(text: string): string[] {
  return cleanText(text)
    .split(/\n\s*\n/gu)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
