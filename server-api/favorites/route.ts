import { listFavorites } from "@/lib/library/personal-data";

export async function GET() {
  const favorites = await listFavorites();
  return Response.json({ data: favorites });
}
