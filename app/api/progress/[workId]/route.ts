import { getProgress } from "@/lib/library/personal-data";

type ProgressRouteContext = {
  params: Promise<{ workId: string }>;
};

export async function GET(_request: Request, context: ProgressRouteContext) {
  const { workId } = await context.params;
  const progress = await getProgress(workId);

  if (!progress) {
    return Response.json(
      { error: { code: "PROGRESS_NOT_FOUND", message: "暂无播放进度。" } },
      { status: 404 },
    );
  }

  return Response.json({ data: progress });
}
