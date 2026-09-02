import Link from "next/link";

export default function AuthorNotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-12 text-center sm:px-8">
      <p className="text-sm text-[var(--muted)]">404 · 作者未收录</p>
      <h1 className="font-serif mt-3 text-3xl leading-tight">这份作者档案还没有整理好</h1>
      <p className="mt-4 leading-7 text-[var(--muted)]">
        第一阶段先完整整理苏轼与《记承天寺夜游》这份样本。
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
