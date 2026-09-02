import { z } from "zod";
import { saveProgress } from "@/lib/library/personal-data";

const progressSchema = z.object({
  workId: z.string().trim().min(1),
  segmentId: z.string().trim().min(1).optional(),
  positionMs: z.number().int().min(0),
  completed: z.boolean(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "INVALID_JSON", message: "请求体不是合法 JSON。" } },
      { status: 400 },
    );
  }

  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: { code: "INVALID_PROGRESS", message: parsed.error.issues[0]?.message ?? "进度数据不合法。" } },
      { status: 400 },
    );
  }

  const progress = await saveProgress(parsed.data);
  return Response.json({ data: progress });
}
