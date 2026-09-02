import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parseAnnotationsJson, parseAuthorJson, parseWorkMarkdown } from "./parser";
import { queryWorks } from "./query";
import type { Annotation, Author, RepositoryOptions, Work, WorkQuery } from "./types";

export type FileContentRepository = {
  getAllWorks(query?: WorkQuery): Promise<Work[]>;
  getWorkBySlug(slug: string): Promise<Work | null>;
  getAuthorBySlug(slug: string): Promise<Author | null>;
};

export function createFileContentRepository(
  options: RepositoryOptions = {},
): FileContentRepository {
  const contentDir = options.contentDir ?? path.join(process.cwd(), "content");
  const worksDir = path.join(contentDir, "works");
  const authorsDir = path.join(contentDir, "authors");

  async function getAuthorBySlug(slug: string): Promise<Author | null> {
    try {
      return parseAuthorJson(await readFile(path.join(authorsDir, `${slug}.json`), "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  async function loadWork(filename: string): Promise<Work> {
    const workPath = path.join(worksDir, filename);
    const slug = filename.replace(/\.md$/u, "");
    const annotationsPath = path.join(worksDir, `${slug}.annotations.json`);
    let annotations: Annotation[] = [];
    try {
      annotations = parseAnnotationsJson(await readFile(annotationsPath, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    const { work } = parseWorkMarkdown(await readFile(workPath, "utf8"), {
      sourcePath: workPath,
      annotations,
      mode: options.mode,
    });
    work.author = (await getAuthorBySlug(work.authorId)) ?? undefined;
    return work;
  }

  async function getAllWorks(query: WorkQuery = {}): Promise<Work[]> {
    const files = (await readdir(worksDir)).filter(
      (filename) => filename.endsWith(".md") && !filename.endsWith(".annotations.md"),
    );
    const works = await Promise.all(files.sort().map(loadWork));
    return queryWorks(works, query);
  }

  async function getWorkBySlug(slug: string): Promise<Work | null> {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) return null;
    try {
      return await loadWork(`${slug}.md`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }

  return { getAllWorks, getWorkBySlug, getAuthorBySlug };
}

export function getAllWorks(
  query: WorkQuery = {},
  options: RepositoryOptions = {},
): Promise<Work[]> {
  return createFileContentRepository(options).getAllWorks(query);
}

export function getWorkBySlug(
  slug: string,
  options: RepositoryOptions = {},
): Promise<Work | null> {
  return createFileContentRepository(options).getWorkBySlug(slug);
}

export function getAuthorBySlug(
  slug: string,
  options: RepositoryOptions = {},
): Promise<Author | null> {
  return createFileContentRepository(options).getAuthorBySlug(slug);
}
