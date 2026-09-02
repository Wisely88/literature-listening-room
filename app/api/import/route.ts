import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { importEbookToLibrary } from "@/lib/ebook/import-ebook";

export const runtime = "nodejs";

function tokenMatches(request: Request, expected: string): boolean {
  const authorization = request.headers.get("authorization");
  const provided = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const actualBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function POST(request: Request) {
  const adminToken = process.env.ADMIN_TOKEN?.trim();
  if (!adminToken) {
    return NextResponse.json(
      { error: "私人导入尚未配置。请先在服务端设置 ADMIN_TOKEN。" },
      { status: 503 },
    );
  }

  if (!tokenMatches(request, adminToken)) {
    return NextResponse.json({ error: "私人导入口令不正确。" }, { status: 401 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2_000_000) {
    return NextResponse.json({ error: "整理后的正文不能超过 2 MB。" }, { status: 413 });
  }

  try {
    const result = await importEbookToLibrary(await request.json());
    return NextResponse.json({ work: result }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "导入请求不是有效 JSON。" }, { status: 400 });
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "导入字段不完整。" },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "电子书导入失败。";
    const status = message.includes("已存在") ? 409 : 500;
    return NextResponse.json(
      { error: status === 500 ? "电子书导入失败，请检查服务日志。" : message },
      { status },
    );
  }
}
