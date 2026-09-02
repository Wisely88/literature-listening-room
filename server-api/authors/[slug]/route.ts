import { getAuthorBySlug } from "@/lib/content/repository";

type AuthorRouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: AuthorRouteContext) {
  const { slug } = await context.params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return Response.json(
      {
        error: {
          code: "AUTHOR_NOT_FOUND",
          message: `未找到作者：${slug}`,
        },
      },
      { status: 404 },
    );
  }

  return Response.json({ data: author });
}
