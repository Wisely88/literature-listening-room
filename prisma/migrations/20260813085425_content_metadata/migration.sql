/*
  Warnings:

  - Added the required column `provider` to the `TTSJob` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voice` to the `TTSJob` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Author" ADD COLUMN "country" TEXT;
ALTER TABLE "Author" ADD COLUMN "courtesyNames" TEXT;
ALTER TABLE "Author" ADD COLUMN "relatedPeople" TEXT;
ALTER TABLE "Author" ADD COLUMN "representativeWorks" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TTSJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "voice" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TTSJob" ("createdAt", "error", "id", "progress", "status", "updatedAt", "workId") SELECT "createdAt", "error", "id", "progress", "status", "updatedAt", "workId" FROM "TTSJob";
DROP TABLE "TTSJob";
ALTER TABLE "new_TTSJob" RENAME TO "TTSJob";
CREATE TABLE "new_Work" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "aliases" TEXT NOT NULL DEFAULT '[]',
    "authorId" TEXT,
    "category" TEXT NOT NULL,
    "dynasty" TEXT,
    "language" TEXT NOT NULL DEFAULT 'zh-CN',
    "summary" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "moods" TEXT NOT NULL DEFAULT '[]',
    "ambience" TEXT NOT NULL DEFAULT '[]',
    "defaultAmbience" TEXT,
    "background" TEXT,
    "translation" TEXT,
    "appreciation" TEXT,
    "estimatedMinutes" INTEGER,
    "rightsStatus" TEXT NOT NULL,
    "sourceNote" TEXT,
    "editorialNotes" TEXT NOT NULL DEFAULT '[]',
    "pronunciationOverrides" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Work_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Work" ("appreciation", "authorId", "background", "category", "createdAt", "dynasty", "estimatedMinutes", "id", "language", "rightsStatus", "slug", "sourceNote", "summary", "title", "translation", "updatedAt") SELECT "appreciation", "authorId", "background", "category", "createdAt", "dynasty", "estimatedMinutes", "id", "language", "rightsStatus", "slug", "sourceNote", "summary", "title", "translation", "updatedAt" FROM "Work";
DROP TABLE "Work";
ALTER TABLE "new_Work" RENAME TO "Work";
CREATE UNIQUE INDEX "Work_slug_key" ON "Work"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
