import { addFavorite, isFavorite, removeFavorite } from "@/lib/library/personal-data";

type FavoriteRouteContext = {
  params: Promise<{ workId: string }>;
};

export async function POST(_request: Request, context: FavoriteRouteContext) {
  const { workId } = await context.params;
  await addFavorite(workId);
  return Response.json({ data: { workId, favorited: true } });
}

export async function DELETE(_request: Request, context: FavoriteRouteContext) {
  const { workId } = await context.params;
  await removeFavorite(workId);
  return Response.json({ data: { workId, favorited: false } });
}

export async function GET(_request: Request, context: FavoriteRouteContext) {
  const { workId } = await context.params;
  return Response.json({ data: { workId, favorited: await isFavorite(workId) } });
}
