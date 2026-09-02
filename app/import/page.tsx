import type { Metadata } from "next";
import Link from "next/link";
import { EbookImporter } from "@/components/import/ebook-importer";

export const metadata: Metadata = {
  title: "导入电子书",
  description: "在浏览器本地解析 EPUB、TXT 或 Markdown，并加入私人文学书架。",
};

export default function ImportPage() {
  const adminConfigured = Boolean(process.env.ADMIN_TOKEN?.trim());

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl overflow-x-hidden px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-[var(--line)] pb-7 sm:pb-9">
        <nav aria-label="面包屑">
          <Link
            className="inline-flex min-h-11 items-center text-sm text-[var(--muted)] underline-offset-4 hover:underline"
            href="/"
          >
            ← 回到听读馆
          </Link>
        </nav>
        <p className="mt-5 text-xs tracking-[0.22em] text-[var(--accent-strong)]">私人内容工具</p>
        <h1 className="font-serif mt-3 text-4xl leading-tight sm:text-5xl">导入电子书</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          原始文件在浏览器本地解析；确认书名、作者、分类与版权状态后，才把整理后的正文写入私人书架。不会自动公开，也不会自动调用云端翻译。
        </p>
      </header>

      <section className="py-8 sm:py-10" aria-label="电子书导入工具">
        <EbookImporter adminConfigured={adminConfigured} />
      </section>
    </main>
  );
}
