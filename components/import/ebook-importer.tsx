"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { LIBRARY_CATEGORIES } from "@/components/library/library-options";
import { parseEbookFile, type ParsedEbook } from "@/lib/ebook/parse-ebook";

type ImportResult = {
  slug: string;
  title: string;
  segments: number;
  estimatedMinutes?: number;
};

function suggestedSlug(title: string): string {
  const latin = title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 80);
  return latin || "private-book-" + Date.now().toString(36);
}

function downloadDraft(book: ParsedEbook, title: string, author: string) {
  const markdown = [
    "# " + title,
    "",
    author ? "作者：" + author : "作者：待整理",
    "",
    "来源格式：" + book.format.toUpperCase(),
    "",
    "## 原文",
    "",
    book.text,
    "",
  ].join("\n");
  const url = URL.createObjectURL(
    new Blob([markdown], { type: "text/markdown;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = suggestedSlug(title) + ".md";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function EbookImporter({ adminConfigured }: { adminConfigured: boolean }) {
  const [book, setBook] = useState<ParsedEbook | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<(typeof LIBRARY_CATEGORIES)[number]>("优秀文章");
  const [rightsStatus, setRightsStatus] = useState<"user-owned" | "personal-reference">(
    "personal-reference",
  );
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle" | "parsing" | "importing">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setStatus("parsing");
    setError("");
    setResult(null);

    try {
      const parsed = await parseEbookFile(file);
      setBook(parsed);
      setTitle(parsed.title);
      setAuthor(parsed.author);
      setSlug(suggestedSlug(parsed.title));
    } catch (parseError) {
      setBook(null);
      setError(parseError instanceof Error ? parseError.message : "电子书解析失败。");
    } finally {
      setStatus("idle");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!book || !adminConfigured) return;
    setStatus("importing");
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          title,
          author,
          category,
          rightsStatus,
          sourceFormat: book.format,
          text: book.text,
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        work?: ImportResult;
      };
      if (!response.ok || !payload.work) {
        throw new Error(payload.error ?? "电子书导入失败。");
      }
      setResult(payload.work);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "电子书导入失败。");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)]">
      <form
        className="space-y-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-sm sm:p-7"
        onSubmit={submit}
      >
        <div>
          <p className="text-xs tracking-[0.18em] text-[var(--accent-strong)]">第一步</p>
          <h2 className="font-serif mt-2 text-2xl">选择电子书</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
            支持 EPUB、TXT 与 Markdown，单个文件不超过 20 MB。原始文件只在当前浏览器中解析。
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium">电子书文件</span>
          <input
            accept=".epub,.txt,.md,.markdown,application/epub+zip,text/plain,text/markdown"
            className="block min-h-12 w-full rounded-2xl border border-[var(--line)] bg-transparent p-3 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:text-[var(--ink)]"
            onChange={selectFile}
            type="file"
          />
        </label>

        {status === "parsing" ? (
          <p aria-live="polite" className="text-sm text-[var(--muted)]">正在本机解析电子书……</p>
        ) : null}

        {book ? (
          <fieldset className="grid gap-4 border-0 p-0 sm:grid-cols-2">
            <legend className="mb-3 w-full text-xs tracking-[0.18em] text-[var(--accent-strong)]">
              第二步 · 确认书架信息
            </legend>
            <label className="sm:col-span-2">
              <span className="mb-2 block text-sm font-medium">书名</span>
              <input
                className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-transparent px-4"
                maxLength={160}
                onChange={(event) => setTitle(event.currentTarget.value)}
                required
                value={title}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">作者</span>
              <input
                className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-transparent px-4"
                maxLength={120}
                onChange={(event) => setAuthor(event.currentTarget.value)}
                placeholder="未知作者可留空"
                value={author}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">英文书架标识</span>
              <input
                className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-transparent px-4"
                onChange={(event) => setSlug(event.currentTarget.value.toLowerCase())}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
                value={slug}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">分类</span>
              <select
                className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4"
                onChange={(event) =>
                  setCategory(event.currentTarget.value as (typeof LIBRARY_CATEGORIES)[number])
                }
                value={category}
              >
                {LIBRARY_CATEGORIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium">版权状态</span>
              <select
                className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4"
                onChange={(event) =>
                  setRightsStatus(event.currentTarget.value as typeof rightsStatus)
                }
                value={rightsStatus}
              >
                <option value="personal-reference">仅供个人参考</option>
                <option value="user-owned">我拥有合法使用权</option>
              </select>
            </label>

            {adminConfigured ? (
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium">私人导入口令</span>
                <input
                  autoComplete="off"
                  className="min-h-12 w-full rounded-xl border border-[var(--line)] bg-transparent px-4"
                  onChange={(event) => setToken(event.currentTarget.value)}
                  required
                  type="password"
                  value={token}
                />
              </label>
            ) : (
              <div className="sm:col-span-2 rounded-2xl border border-amber-600/35 bg-amber-500/10 p-4 text-sm leading-7">
                服务端尚未设置 ADMIN_TOKEN。你仍可解析、预览并下载整理稿；配置私人导入口令后，才能写入正式书架。
              </div>
            )}

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                className="min-h-11 rounded-full bg-[var(--ink)] px-5 text-sm font-semibold text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!adminConfigured || status === "importing"}
                type="submit"
              >
                {status === "importing" ? "正在导入……" : "导入私人书架"}
              </button>
              <button
                className="min-h-11 rounded-full border border-[var(--line)] px-5 text-sm"
                onClick={() => downloadDraft(book, title, author)}
                type="button"
              >
                下载整理稿
              </button>
            </div>
          </fieldset>
        ) : null}

        {error ? <p className="text-sm text-red-700 dark:text-red-300" role="alert">{error}</p> : null}
        {result ? (
          <div className="rounded-2xl border border-emerald-700/30 bg-emerald-500/10 p-4" role="status">
            <p className="font-medium">《{result.title}》已加入私人书架。</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              共 {result.segments} 段，约 {result.estimatedMinutes ?? "—"} 分钟；正式朗读音频需另行生成。
            </p>
            <Link className="mt-3 inline-flex min-h-11 items-center underline underline-offset-4" href={"/work/" + result.slug}>
              打开这本书
            </Link>
          </div>
        ) : null}
      </form>

      <aside className="rounded-3xl border border-[var(--line)] p-5 sm:p-7">
        <p className="text-xs tracking-[0.18em] text-[var(--accent-strong)]">本地预览</p>
        {book ? (
          <>
            <h2 className="font-serif mt-3 text-2xl">{title || book.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {book.format.toUpperCase()} · {book.characterCount.toLocaleString("zh-CN")} 字符
            </p>
            <div className="mt-5 max-h-[32rem] overflow-y-auto border-t border-[var(--line)] pt-5 text-sm leading-8">
              {book.text.slice(0, 2_400)}
              {book.text.length > 2_400 ? "……" : ""}
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            选择文件后，这里会显示书名、字数与正文开头。确认无乱码、章节顺序正确后再导入。
          </p>
        )}
      </aside>
    </div>
  );
}
