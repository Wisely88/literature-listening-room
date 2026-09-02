import { closeSync, existsSync, mkdirSync, openSync } from "node:fs";
import { dirname, resolve } from "node:path";

function databasePath(url: string): string {
  if (!url.startsWith("file:")) {
    throw new Error("V1 仅支持 file: SQLite DATABASE_URL");
  }

  return resolve(process.cwd(), url.slice("file:".length));
}

const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
const path = databasePath(url);

mkdirSync(dirname(path), { recursive: true });

if (!existsSync(path)) {
  closeSync(openSync(path, "wx"));
  console.info(`Created SQLite database at ${path}`);
}
