import Link from "next/link";

export default function WorkNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-12 text-center">
      <p className="text-sm text-[var(--muted)]">404 · 作品未收录</p>
      <h1 className="font-serif mt-3 text-3xl">这一页暂时没有文章</h1>
      <p className="mt-4 leading-7 text-[var(--muted)]">
        当前只整理《记承天寺夜游》这一篇 Golden Sample。
      </p>
      <Link
        className="mx-auto mt-7 inline-flex min-h-11 items-center underline underline-offset-4"
        href="/"
      >
        返回听读馆
      </Link>
    </main>
  );
}
