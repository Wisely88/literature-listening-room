import "server-only";

import { prisma } from "@/lib/db/client";

export type ProgressInput = {
  workId: string;
  segmentId?: string;
  positionMs: number;
  completed: boolean;
};

export async function saveProgress(input: ProgressInput) {
  return prisma.playbackProgress.upsert({
    where: { workId: input.workId },
    create: {
      id: "progress:" + input.workId,
      workId: input.workId,
      segmentId: input.segmentId,
      positionMs: input.positionMs,
      completed: input.completed,
      lastOpenedAt: new Date(),
    },
    update: {
      segmentId: input.segmentId,
      positionMs: input.positionMs,
      completed: input.completed,
      lastOpenedAt: new Date(),
    },
  });
}

export async function getProgress(workId: string) {
  return prisma.playbackProgress.findUnique({ where: { workId } });
}

export async function listRecentProgress(limit = 10) {
  const rows = await prisma.playbackProgress.findMany({
    orderBy: { lastOpenedAt: "desc" },
    take: limit,
  });
  return rows.map((row) => ({
    workId: row.workId,
    segmentId: row.segmentId,
    positionMs: row.positionMs,
    completed: row.completed,
    lastOpenedAt: row.lastOpenedAt,
  }));
}

export async function addFavorite(workId: string) {
  return prisma.favorite.upsert({
    where: { workId },
    create: { id: "favorite:" + workId, workId },
    update: {},
  });
}

export async function removeFavorite(workId: string) {
  return prisma.favorite.deleteMany({ where: { workId } });
}

export async function isFavorite(workId: string) {
  return (await prisma.favorite.findUnique({ where: { workId } })) !== null;
}

export async function listFavorites() {
  const rows = await prisma.favorite.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => ({ workId: row.workId, createdAt: row.createdAt }));
}
