import { describe, expect, it } from "vitest";
import { databaseAnnotationId, databaseSegmentId } from "@/prisma/seed";

describe("Golden Sample 数据库 ID", () => {
  it("把内容段落 ID 映射成作品内稳定且全局唯一的 ID", () => {
    expect(databaseSegmentId("ji-cheng-tian-si-ye-you", "seg-001")).toBe(
      "ji-cheng-tian-si-ye-you:seg-001",
    );
  });

  it("把注释 ID 映射成作品内稳定且全局唯一的 ID", () => {
    expect(databaseAnnotationId("ji-cheng-tian-si-ye-you", "ann-001")).toBe(
      "ji-cheng-tian-si-ye-you:ann-001",
    );
  });
});
