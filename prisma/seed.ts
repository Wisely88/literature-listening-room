import { pathToFileURL } from "node:url";
import { prisma } from "@/lib/db/client";
import {
  ContentValidationError,
  getAllWorks,
  getAuthorBySlug,
  getWorkBySlug,
  type RepositoryOptions,
  type Work,
} from "@/lib/content";

export const GOLDEN_SAMPLE_SLUG = "ji-cheng-tian-si-ye-you";

export type SeedSummary = {
  works: number;
  authors: number;
  segments: number;
  annotations: number;
};

export function databaseSegmentId(workId: string, segmentId: string): string {
  return `${workId}:${segmentId}`;
}

export function databaseAnnotationId(workId: string, annotationId: string): string {
  return `${workId}:${annotationId}`;
}

function json(value: unknown): string {
  return JSON.stringify(value);
}

export async function seedWork(
  work: Work,
  options: RepositoryOptions = {},
): Promise<SeedSummary> {
  const author = work.author ?? (await getAuthorBySlug(work.authorId, options));
  if (!author) {
    throw new ContentValidationError(`作品 ${work.slug} 引用了不存在的作者：${work.authorId}`);
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.author.upsert({
      where: { id: author.id },
      create: {
        id: author.id,
        slug: author.slug,
        name: author.name,
        aliases: json(author.aliases),
        courtesyNames: json(author.courtesyNames),
        bio: author.bio,
        dynasty: author.dynasty,
        country: author.country,
        birthYear: author.birthYear,
        deathYear: author.deathYear,
        styleSummary: author.styleSummary,
        timeline: json(author.timeline),
        representativeWorks: json(author.representativeWorks),
        relatedPeople: json(author.relatedPeople),
      },
      update: {
        slug: author.slug,
        name: author.name,
        aliases: json(author.aliases),
        courtesyNames: json(author.courtesyNames),
        bio: author.bio,
        dynasty: author.dynasty,
        country: author.country,
        birthYear: author.birthYear,
        deathYear: author.deathYear,
        styleSummary: author.styleSummary,
        timeline: json(author.timeline),
        representativeWorks: json(author.representativeWorks),
        relatedPeople: json(author.relatedPeople),
      },
    });

    await transaction.work.upsert({
      where: { id: work.id },
      create: {
        id: work.id,
        slug: work.slug,
        title: work.title,
        aliases: json(work.aliases),
        authorId: author.id,
        category: work.category,
        foreignGenre: work.foreignGenre,
        dynasty: work.dynasty,
        language: work.language,
        summary: work.summary,
        tags: json(work.tags),
        moods: json(work.moods),
        ambience: json(work.ambience),
        defaultAmbience: work.defaultAmbience,
        background: work.background,
        translation: work.translation,
        appreciation: work.appreciation,
        estimatedMinutes: work.estimatedMinutes,
        rightsStatus: work.rightsStatus,
        sourceNote: work.sourceNote,
        editorialNotes: json(work.editorialNotes),
        pronunciationOverrides: json(work.pronunciationOverrides),
      },
      update: {
        slug: work.slug,
        title: work.title,
        aliases: json(work.aliases),
        authorId: author.id,
        category: work.category,
        foreignGenre: work.foreignGenre,
        dynasty: work.dynasty,
        language: work.language,
        summary: work.summary,
        tags: json(work.tags),
        moods: json(work.moods),
        ambience: json(work.ambience),
        defaultAmbience: work.defaultAmbience,
        background: work.background,
        translation: work.translation,
        appreciation: work.appreciation,
        estimatedMinutes: work.estimatedMinutes,
        rightsStatus: work.rightsStatus,
        sourceNote: work.sourceNote,
        editorialNotes: json(work.editorialNotes),
        pronunciationOverrides: json(work.pronunciationOverrides),
      },
    });

    for (const segment of work.segments) {
      const id = databaseSegmentId(work.id, segment.id);
      await transaction.segment.upsert({
        where: { id },
        create: {
          id,
          workId: work.id,
          order: segment.order,
          displayText: segment.displayText,
          speechText: segment.speechText,
          translation: segment.translation,
        },
        update: {
          workId: work.id,
          order: segment.order,
          displayText: segment.displayText,
          speechText: segment.speechText,
          translation: segment.translation,
        },
      });
    }

    for (const annotation of work.annotations) {
      const id = databaseAnnotationId(work.id, annotation.id);
      const segmentId = annotation.segmentId
        ? databaseSegmentId(work.id, annotation.segmentId)
        : undefined;
      await transaction.annotation.upsert({
        where: { id },
        create: {
          id,
          workId: work.id,
          segmentId,
          term: annotation.term,
          explanation: annotation.explanation,
          pronunciation: annotation.pronunciation,
          type: annotation.type,
        },
        update: {
          workId: work.id,
          segmentId,
          term: annotation.term,
          explanation: annotation.explanation,
          pronunciation: annotation.pronunciation,
          type: annotation.type,
        },
      });
    }
  });

  return {
    works: 1,
    authors: 1,
    segments: work.segments.length,
    annotations: work.annotations.length,
  };
}

export async function seedGoldenSample(
  options: RepositoryOptions = {},
): Promise<SeedSummary> {
  const work = await getWorkBySlug(GOLDEN_SAMPLE_SLUG, options);
  if (!work) {
    throw new ContentValidationError(`找不到 Golden Sample：${GOLDEN_SAMPLE_SLUG}`);
  }
  return seedWork(work, options);
}

export async function seedAllWorks(
  options: RepositoryOptions = {},
): Promise<SeedSummary> {
  const works = await getAllWorks({}, options);
  const authors = new Set<string>();
  let segments = 0;
  let annotations = 0;

  for (const work of works) {
    const summary = await seedWork(work, options);
    authors.add(work.authorId);
    segments += summary.segments;
    annotations += summary.annotations;
  }

  return {
    works: works.length,
    authors: authors.size,
    segments,
    annotations,
  };
}

async function main(): Promise<void> {
  try {
    const summary = await seedAllWorks();
    console.log(
      `Seed 完成：${summary.works} 篇作品，${summary.authors} 位作者，${summary.segments} 个段落，${summary.annotations} 条注释。`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

const entrypoint = process.argv[1];
if (entrypoint && import.meta.url === pathToFileURL(entrypoint).href) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
