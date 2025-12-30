require("dotenv").config({ path: "../.env" });

const fetch = require("node-fetch");
const { Client } = require("pg");

const BASE_URL = "http://localhost:3000";
const db = new Client({ connectionString: process.env.DATABASE_URL });

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function postMessage(body) {
  const res = await fetch(`${BASE_URL}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function getHistory(sessionId) {
  const res = await fetch(`${BASE_URL}/chat/history/${sessionId}`);
  return res.json();
}

async function resetDb() {
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM conversations");
}

(async function run() {
  console.log("\n=== Milestone 2 Backend Tests ===");

  await db.connect();
  await resetDb();

  // ---------- TEST 1: Happy path ----------
  console.log("\nTEST 1: LLM success → completed");

  const r1 = await postMessage({ message: "hello milestone 2" });
  const sessionId1 = r1.sessionId;

  await sleep(800); // allow mock LLM to complete

  const h1 = await getHistory(sessionId1);

  console.assert(h1.messages.length === 2, "Expected 2 messages");

  const assistant1 = h1.messages[1];
  console.assert(assistant1.sender === "assistant", "Expected assistant reply");
  console.assert(assistant1.status === "completed", "Expected completed status");
  console.assert(assistant1.text, "Expected assistant text");

  console.log("✓ Assistant completed");

  // ---------- TEST 2: Failure path ----------
  console.log("\nTEST 2: LLM failure → failed");

  const r2 = await postMessage({ message: "fail this message" });
  const sessionId2 = r2.sessionId;

  await sleep(800);

  const h2 = await getHistory(sessionId2);

  console.assert(h2.messages.length === 2, "Expected 2 messages");

  const assistant2 = h2.messages[1];
  console.assert(assistant2.status === "failed", "Expected failed status");
  console.assert(assistant2.error, "Expected error message");

  console.log("✓ Assistant failure persisted");

  // ---------- TEST 3: Conversation integrity ----------
  console.log("\nTEST 3: No orphaned messages");

  const rows = await db.query(`
    SELECT c.id, COUNT(m.id)
    FROM conversations c
    LEFT JOIN messages m ON m.conversation_id = c.id
    GROUP BY c.id
  `);

  rows.rows.forEach(r => {
    console.assert(
      r.count >= 2,
      "Conversation should have at least user + assistant"
    );
  });

  console.log("✓ Conversation integrity holds");

  console.log("\n✅ Milestone 2 backend tests passed");

  await db.end();
})();
