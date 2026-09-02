import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/import/route";

const originalToken = process.env.ADMIN_TOKEN;

afterEach(() => {
  if (originalToken === undefined) {
    delete process.env.ADMIN_TOKEN;
  } else {
    process.env.ADMIN_TOKEN = originalToken;
  }
});

describe("ebook import API", () => {
  it("reports configuration state instead of accepting unauthenticated writes", async () => {
    delete process.env.ADMIN_TOKEN;
    const response = await POST(new Request("http://localhost/api/import", { method: "POST" }));

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("ADMIN_TOKEN") });
  });

  it("rejects an incorrect private import token", async () => {
    process.env.ADMIN_TOKEN = "test-private-token";
    const response = await POST(
      new Request("http://localhost/api/import", {
        method: "POST",
        headers: { Authorization: "Bearer wrong-token" },
      }),
    );

    expect(response.status).toBe(401);
  });
});
