import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { ebookTextToParagraphs, parseEbookFile } from "@/lib/ebook/parse-ebook";

describe("ebook parser", () => {
  it("parses UTF-8 text and keeps paragraph boundaries", async () => {
    const file = new File(["第一段。\n\n第二段。"], "夜读.txt", { type: "text/plain" });
    const parsed = await parseEbookFile(file);

    expect(parsed.format).toBe("txt");
    expect(parsed.title).toBe("夜读");
    expect(ebookTextToParagraphs(parsed.text)).toEqual(["第一段。", "第二段。"]);
  });

  it("parses EPUB metadata and reading order locally", async () => {
    const zip = new JSZip();
    zip.file(
      "META-INF/container.xml",
      '<?xml version="1.0"?><container><rootfiles><rootfile full-path="OEBPS/content.opf"/></rootfiles></container>',
    );
    zip.file(
      "OEBPS/content.opf",
      '<?xml version="1.0"?><package><metadata><dc:title xmlns:dc="x">月夜</dc:title><dc:creator xmlns:dc="x">苏轼</dc:creator></metadata><manifest><item id="p1" href="p1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="p1"/></spine></package>',
    );
    zip.file("OEBPS/p1.xhtml", "<html><body><h1>标题</h1><p>正文第一段。</p><p>正文第二段。</p></body></html>");
    const file = new File([await zip.generateAsync({ type: "arraybuffer" })], "月夜.epub", {
      type: "application/epub+zip",
    });

    const parsed = await parseEbookFile(file);

    expect(parsed.format).toBe("epub");
    expect(parsed.title).toBe("月夜");
    expect(parsed.author).toBe("苏轼");
    expect(parsed.text).toContain("正文第一段。");
    expect(parsed.text).toContain("正文第二段。");
  });
});
