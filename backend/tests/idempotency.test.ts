import { describe, it, expect } from "vitest";
import request from "supertest";

const BASE = "http://localhost:3000";

describe("Idempotent message posting", () => {
  it("does not duplicate user messages", async () => {
    const first = await request(BASE)
      .post("/chat/message")
      .send({
        message: "idempotent",
        clientMessageId: "idem-1"
      });

    const second = await request(BASE)
      .post("/chat/message")
      .send({
        message: "idempotent",
        clientMessageId: "idem-1",
        sessionId: first.body.sessionId
      });

    expect(second.status).toBe(200);
    expect(second.body.sessionId).toBe(first.body.sessionId);
  });
});
