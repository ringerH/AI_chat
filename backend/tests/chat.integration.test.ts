import { describe, it, expect } from "vitest";
import request from "supertest";

const BASE = "http://localhost:3000";

describe("Chat integration", () => {
  it("creates conversation and accepts message", async () => {
    const res = await request(BASE)
      .post("/chat/message")
      .send({
        message: "hello",
        clientMessageId: "int-1"
      });

    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeDefined();
  });
});
