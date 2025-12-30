import { describe, it, expect } from "vitest";
import request from "supertest";

const BASE = "http://localhost:3000";

describe("Failure handling", () => {
  it("handles provider failure cleanly", async () => {
    const res = await request(BASE)
      .post("/chat/message")
      .send({
        message: "fail test",
        clientMessageId: "fail-1"
      });

    expect(res.status).toBe(200);
  });
});
