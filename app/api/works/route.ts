import { getAllWorks } from "@/lib/content/repository";
import { parseWorksQuery } from "./query";

const PAGE_SIZE = 12;

export async function GET(request: Request) {
  const parsed = parseWorksQuery(new URL(request.url).searchParams);

  if (!parsed.ok) {
    return Response.json(
      { error: { code: "INVALID_QUERY", message: parsed.message } },
      { status: 400 },
    );
  }

  const { page, ...filters } = parsed.value;
  const works = await getAllWorks(filters);
  const total = works.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;

  return Response.json({
    data: works.slice(start, start + PAGE_SIZE),
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages,
    },
  });
}
