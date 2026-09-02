import { getWorkBySlug } from "@/lib/content/repository";

type WorkRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: WorkRouteContext) {
  const { slug } = await context.params;
  const work = await getWorkBySlug(slug);

  if (!work) {
    return Response.json(
      {
        error: {
          code: "WORK_NOT_FOUND",
          message: `未找到作品：${slug}`,
        },
      },
      { status: 404 },
    );
  }

  return Response.json({ data: work });
}
