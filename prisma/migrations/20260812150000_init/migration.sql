CREATE TABLE "Author" (
  "id" TEXT NOT NULL PRIMARY KEY, "slug" TEXT NOT NULL, "name" TEXT NOT NULL,
  "aliases" TEXT, "bio" TEXT, "dynasty" TEXT, "birthYear" INTEGER,
  "deathYear" INTEGER, "styleSummary" TEXT, "timeline" TEXT
);
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");
CREATE TABLE "Work" (
  "id" TEXT NOT NULL PRIMARY KEY, "slug" TEXT NOT NULL, "title" TEXT NOT NULL,
  "authorId" TEXT, "category" TEXT NOT NULL, "dynasty" TEXT,
  "language" TEXT NOT NULL DEFAULT 'zh-CN', "summary" TEXT, "background" TEXT,
  "translation" TEXT, "appreciation" TEXT, "estimatedMinutes" INTEGER,
  "rightsStatus" TEXT NOT NULL, "sourceNote" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Work_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Work_slug_key" ON "Work"("slug");
CREATE TABLE "Segment" (
  "id" TEXT NOT NULL PRIMARY KEY, "workId" TEXT NOT NULL, "order" INTEGER NOT NULL,
  "displayText" TEXT NOT NULL, "speechText" TEXT, "translation" TEXT,
  CONSTRAINT "Segment_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Segment_workId_order_key" ON "Segment"("workId", "order");
CREATE TABLE "Annotation" (
  "id" TEXT NOT NULL PRIMARY KEY, "workId" TEXT NOT NULL, "segmentId" TEXT,
  "term" TEXT NOT NULL, "explanation" TEXT NOT NULL, "pronunciation" TEXT, "type" TEXT NOT NULL,
  CONSTRAINT "Annotation_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "AudioAsset" (
  "id" TEXT NOT NULL PRIMARY KEY, "workId" TEXT NOT NULL, "segmentId" TEXT,
  "provider" TEXT NOT NULL, "voice" TEXT NOT NULL, "url" TEXT NOT NULL,
  "durationMs" INTEGER, "checksum" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AudioAsset_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "PlaybackProgress" (
  "id" TEXT NOT NULL PRIMARY KEY, "workId" TEXT NOT NULL, "segmentId" TEXT,
  "positionMs" INTEGER NOT NULL DEFAULT 0, "completed" BOOLEAN NOT NULL DEFAULT false,
  "lastOpenedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "PlaybackProgress_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "PlaybackProgress_workId_key" ON "PlaybackProgress"("workId");
CREATE TABLE "Favorite" (
  "id" TEXT NOT NULL PRIMARY KEY, "workId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Favorite_workId_key" ON "Favorite"("workId");
CREATE TABLE "TTSJob" (
  "id" TEXT NOT NULL PRIMARY KEY, "workId" TEXT NOT NULL, "status" TEXT NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0, "error" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL
);
