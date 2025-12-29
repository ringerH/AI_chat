require("dotenv").config({ path: "../.env" });

const fetch = require("node-fetch");
const pg = require("pg");
const Client = pg.Client;

const BASE_URL = "http://localhost:3000";
const db = new Client({ connectionString: process.env.DATABASE_URL });

async function postMessage(body) {
  const res = await fetch(`${BASE_URL}/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return { status: res.status, body: await res.json() };
}

async function getHistory(sessionId) {
  const res = await fetch(`${BASE_URL}/chat/history/${sessionId}`);
  return { status: res.status, body: await res.json() };
}

async function resetDb() {
  await db.query("DELETE FROM messages");
  await db.query("DELETE FROM conversations");
}

(async function run() {
  await db.connect();
  await resetDb();

  console.log("\nTEST 1: History returns inserted messages");

  const r1 = await postMessage({ message: "Hello M1" });
  const sessionId = r1.body.sessionId;

  await postMessage({ message: "Second M1", sessionId });
  await postMessage({ message: "Third M1", sessionId });

  const history = await getHistory(sessionId);

  console.assert(history.status === 200, "History status not 200");
  console.assert(history.body.messages.length === 3, "Expected 3 messages");
  console.assert(
    history.body.messages[0].text === "Hello M1",
    "Ordering incorrect"
  );

  console.log("✓ History retrieval works");

  console.log("\nTEST 2: Partial conversation allowed");

  const partial = await postMessage({ message: "Lonely message" });
  const h2 = await getHistory(partial.body.sessionId);

  console.assert(h2.body.messages.length === 1, "Partial convo broken");
  console.log("✓ Partial conversation valid");

  console.log("\nTEST 3: Invalid session");

  const invalid = await getHistory("invalid-session-id");
  console.assert(invalid.status === 200, "Invalid session should not crash");
  console.assert(
    Array.isArray(invalid.body.messages),
    "Expected messages array"
  );

  console.log("✓ Invalid session handled");

  console.log("\nTEST 4: History is read-only");

  const before = await db.query("SELECT COUNT(*) FROM messages");
  await getHistory(sessionId);
  const after = await db.query("SELECT COUNT(*) FROM messages");

  console.assert(
    before.rows[0].count === after.rows[0].count,
    "History mutated DB"
  );

  console.log("✓ Read-only invariant preserved");

  console.log("\n✅ Milestone 1 backend tests passed");

  await db.end();
})();
