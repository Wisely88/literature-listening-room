import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ReaderTabs } from "@/components/reader/ReaderTabs";
import type { Work } from "@/lib/content/types";

const work: Work = {
  id: "ji-cheng-tian-si-ye-you",
  slug: "ji-cheng-tian-si-ye-you",
  title: "记承天寺夜游",
  aliases: [],
  authorId: "su-shi",
  author: {
    id: "su-shi",
    slug: "su-shi",
    name: "苏轼",
    aliases: ["苏东坡"],
    courtesyNames: ["子瞻"],
    birthYear: 1037,
    deathYear: 1101,
    dynasty: "北宋",
    country: "中国",
    bio: "北宋文学家。",
    styleSummary: "散文自然畅达。",
    timeline: [],
    representativeWorks: [],
    relatedPeople: [],
  },
  category: "古文",
  dynasty: "北宋",
  language: "zh-CN",
  estimatedMinutes: 2,
  rightsStatus: "public-domain",
  summary: "月夜小品。",
  tags: [],
  moods: [],
  ambience: [],
  editorialNotes: [],
  pronunciationOverrides: [],
  background: "元丰二年，苏轼因诗文获罪。",
  translation: "月光照进门来。",
  appreciation: "文章以极少文字写月色。",
  segments: [
    {
      id: "seg-001",
      order: 0,
      displayText: "月色入户，欣然起行。",
      speechText: "月色入户，欣然起行。",
      translation: "月光照进门来，我欣喜地起身出门。",
    },
  ],
  annotations: [
    {
      id: "ann-001",
      workId: "ji-cheng-tian-si-ye-you",
      segmentId: "seg-001",
      term: "欣然",
      explanation: "高兴、欣喜的样子。",
      pronunciation: "xīn rán",
      type: "word",
    },
  ],
};

describe("ReaderTabs", () => {
  it("切换六个阅读面板并保留在同一页内", async () => {
    const user = userEvent.setup();
    render(<ReaderTabs work={work} />);

    expect(screen.getByRole("tab", { name: "原文" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel", { name: "原文" })).toHaveTextContent(
      "月色入户",
    );

    await user.click(screen.getByRole("tab", { name: "注释" }));
    expect(screen.getByRole("tabpanel", { name: "注释" })).toHaveTextContent("欣然");

    await user.click(screen.getByRole("tab", { name: "现代译文" }));
    expect(screen.getByRole("tabpanel", { name: "现代译文" })).toHaveTextContent("我欣喜地起身");

    await user.click(screen.getByRole("tab", { name: "创作背景" }));
    expect(screen.getByRole("tabpanel", { name: "创作背景" })).toHaveTextContent("元丰二年");

    await user.click(screen.getByRole("tab", { name: "作者" }));
    expect(screen.getByRole("link", { name: "查看苏轼作者页" })).toHaveAttribute(
      "href",
      "/author/su-shi",
    );

    await user.click(screen.getByRole("tab", { name: "赏析" }));
    expect(screen.getByRole("tabpanel", { name: "赏析" })).toHaveTextContent("极少文字");
  });

  it("支持方向键、Home 和 End 的循环键盘操作", async () => {
    const user = userEvent.setup();
    render(<ReaderTabs work={work} />);

    const originalTab = screen.getByRole("tab", { name: "原文" });
    originalTab.focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "赏析" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "赏析" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{Home}");
    expect(originalTab).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "赏析" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(originalTab).toHaveFocus();
  });

  it("内容缺失时显示统一空态", async () => {
    const user = userEvent.setup();
    const incompleteWork: Work = {
      ...work,
      author: undefined,
      background: "",
      appreciation: "",
      annotations: [],
      segments: work.segments.map(({ id, order, displayText, speechText }) => ({
        id,
        order,
        displayText,
        speechText,
      })),
      translation: "",
    };
    render(<ReaderTabs work={incompleteWork} />);

    await user.click(screen.getByRole("tab", { name: "作者" }));
    expect(screen.getByRole("tabpanel", { name: "作者" })).toHaveTextContent("暂未整理");

    await user.click(screen.getByRole("tab", { name: "注释" }));
    expect(screen.getByRole("tabpanel", { name: "注释" })).toHaveTextContent("暂未整理");

    await user.click(screen.getByRole("tab", { name: "现代译文" }));
    expect(screen.getByRole("tabpanel", { name: "现代译文" })).toHaveTextContent("暂未整理");
  });
});
