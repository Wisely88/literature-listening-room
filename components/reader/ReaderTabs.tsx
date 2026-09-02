"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useOptionalPlayer } from "@/lib/player";
import type { Annotation, Author, Segment, Work } from "@/lib/content/types";
import styles from "./reader-tabs.module.css";

const tabs = [
  { id: "original", label: "原文" },
  { id: "annotations", label: "注释" },
  { id: "translation", label: "白话" },
  { id: "background", label: "创作背景" },
  { id: "author", label: "作者" },
  { id: "appreciation", label: "赏析" },
] as const;

type ReaderTabId = (typeof tabs)[number]["id"];

const annotationLabels: Record<Annotation["type"], string> = {
  word: "词义",
  person: "人物",
  place: "地名",
  allusion: "典故",
  history: "历史",
  grammar: "语法",
};

function EmptyPanel() {
  return <p className={styles.empty}>暂未整理</p>;
}

function OriginalPanel({ segments }: { segments: Segment[] }) {
  const player = useOptionalPlayer();

  if (segments.length === 0) return <EmptyPanel />;

  return (
    <div className={`${styles.originalText} ${player ? styles.clickable : ""}`}>
      {segments.map((segment, index) => {
        const isActive = player?.currentSegmentId === segment.id;
        return (
          <p
            aria-current={isActive ? "true" : undefined}
            className={isActive ? styles.activeSegment : undefined}
            data-segment-id={segment.id}
            key={segment.id}
            onClick={player ? () => player.selectSegment(index) : undefined}
          >
            {segment.displayText}
          </p>
        );
      })}
    </div>
  );
}

function AnnotationsPanel({ annotations }: { annotations: Annotation[] }) {
  if (annotations.length === 0) return <EmptyPanel />;

  return (
    <ol className={styles.annotationList}>
      {annotations.map((annotation) => (
        <li className={styles.annotationItem} key={annotation.id}>
          <div className={styles.annotationHeading}>
            <strong>{annotation.term}</strong>
            <span>{annotationLabels[annotation.type]}</span>
          </div>
          {annotation.pronunciation ? (
            <p className={styles.pronunciation}>读音：{annotation.pronunciation}</p>
          ) : null}
          <p>{annotation.explanation}</p>
        </li>
      ))}
    </ol>
  );
}

function TranslationPanel({ segments }: { segments: Segment[] }) {
  const translations = segments.flatMap((segment) =>
    segment.translation ? [{ id: segment.id, text: segment.translation }] : [],
  );

  if (translations.length === 0) return <EmptyPanel />;

  return (
    <div className={styles.supportingText}>
      {translations.map((translation) => (
        <p key={translation.id}>{translation.text}</p>
      ))}
    </div>
  );
}

function TextPanel({ value }: { value: string }) {
  const paragraphs = value
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return <EmptyPanel />;

  return (
    <div className={styles.supportingText}>
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function formatLifespan(author: Author): string | null {
  if (author.birthYear === undefined && author.deathYear === undefined) return null;
  return `${author.birthYear ?? "？"}—${author.deathYear ?? "？"}`;
}

function AuthorPanel({ author }: { author?: Author }) {
  if (!author) return <EmptyPanel />;

  const lifespan = formatLifespan(author);
  const details = [lifespan, author.dynasty, author.country].filter(Boolean).join(" · ");

  return (
    <div className={styles.authorPanel}>
      <div>
        <p className={styles.authorName}>{author.name}</p>
        <p className={styles.authorMeta}>{details || "暂未整理"}</p>
      </div>
      <p>{author.bio || "暂未整理"}</p>
      <div className={styles.authorSection}>
        <h3>文学风格</h3>
        <p>{author.styleSummary || "暂未整理"}</p>
      </div>
      <Link className={styles.authorLink} href={`/author/${author.slug}`}>
        查看{author.name}作者页
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function panelContent(tabId: ReaderTabId, work: Work) {
  switch (tabId) {
    case "original":
      return <OriginalPanel segments={work.segments} />;
    case "annotations":
      return <AnnotationsPanel annotations={work.annotations} />;
    case "translation":
      return <TranslationPanel segments={work.segments} />;
    case "background":
      return <TextPanel value={work.background} />;
    case "author":
      return <AuthorPanel author={work.author} />;
    case "appreciation":
      return <TextPanel value={work.appreciation} />;
  }
}

export function ReaderTabs({ work }: { work: Work }) {
  const [activeTab, setActiveTab] = useState<ReaderTabId>("original");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  function activateTab(index: number) {
    const tab = tabs[index];
    if (!tab) return;
    setActiveTab(tab.id);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;

    if (nextIndex === undefined) return;
    event.preventDefault();
    activateTab(nextIndex);
  }

  return (
    <div className={styles.reader}>
      <div aria-label="阅读内容" className={styles.tabList} role="tablist">
        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              aria-controls={`${baseId}-${tab.id}-panel`}
              aria-selected={isActive}
              className={styles.tab}
              id={`${baseId}-${tab.id}-tab`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <section
          aria-labelledby={`${baseId}-${tab.id}-tab`}
          className={styles.panel}
          hidden={tab.id !== activeTab}
          id={`${baseId}-${tab.id}-panel`}
          key={tab.id}
          role="tabpanel"
          tabIndex={0}
        >
          <div className={styles.panelHeading}>
            <h2>{tab.label}</h2>
            {tab.id === "original" ? <span>{work.segments.length} 段</span> : null}
            {tab.id === "annotations" ? <span>{work.annotations.length} 条</span> : null}
          </div>
          {panelContent(tab.id, work)}
        </section>
      ))}
    </div>
  );
}
