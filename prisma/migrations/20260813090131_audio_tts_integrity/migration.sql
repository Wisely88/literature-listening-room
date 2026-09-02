/*
  Warnings:

  - Added the required column `updatedAt` to the `AudioAsset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idempotencyKey` to the `TTSJob` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AudioAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "segmentId" TEXT,
    "provider" TEXT NOT NULL,
    "voice" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'mp3',
    "url" TEXT NOT NULL,
    "durationMs" INTEGER,
    "checksum" TEXT,
    "sourceHash" TEXT,
    "providerMetadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AudioAsset_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AudioAsset_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AudioAsset" ("checksum", "createdAt", "durationMs", "id", "provider", "segmentId", "url", "voice", "workId") SELECT "checksum", "createdAt", "durationMs", "id", "provider", "segmentId", "url", "voice", "workId" FROM "AudioAsset";
DROP TABLE "AudioAsset";
ALTER TABLE "new_AudioAsset" RENAME TO "AudioAsset";
CREATE INDEX "AudioAsset_workId_provider_voice_idx" ON "AudioAsset"("workId", "provider", "voice");
CREATE UNIQUE INDEX "AudioAsset_segmentId_provider_voice_format_key" ON "AudioAsset"("segmentId", "provider", "voice", "format");
CREATE TABLE "new_TTSJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "voice" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" TEXT NOT NULL,
    "requestConfig" TEXT NOT NULL DEFAULT '{}',
    "error" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TTSJob_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TTSJob" ("createdAt", "error", "id", "progress", "provider", "status", "updatedAt", "voice", "workId") SELECT "createdAt", "error", "id", "progress", "provider", "status", "updatedAt", "voice", "workId" FROM "TTSJob";
DROP TABLE "TTSJob";
ALTER TABLE "new_TTSJob" RENAME TO "TTSJob";
CREATE UNIQUE INDEX "TTSJob_idempotencyKey_key" ON "TTSJob"("idempotencyKey");
CREATE INDEX "TTSJob_workId_status_idx" ON "TTSJob"("workId", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
